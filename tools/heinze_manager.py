import json
import re
import threading
import uuid
from io import BytesIO
from urllib.parse import urlparse

import customtkinter as ctk
import requests
from PIL import Image
from playwright.sync_api import sync_playwright

# ============================================================
# HEINZE FILTER PRODUCT MANAGER
# Windows desktop app: CJ Dropshipping -> Supabase
# ============================================================

SUPABASE_URL = "https://ydxwvvjlbahbflnxebie.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_acYthEvwGT0uMLr0IeOaaA_3YUTZ1Ph"
SUPABASE_BUCKET = "produkt-fotot"

REQUEST_TIMEOUT = 45
MAX_IMAGE_BYTES = 15 * 1024 * 1024
SUPPORTED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def parse_price(value):
    """Try to extract a numeric price from text."""
    if value is None:
        return None
    text = str(value).strip().replace(",", ".")
    match = re.search(r"(?<!\d)(\d{1,6}(?:\.\d{1,2})?)(?!\d)", text)
    if not match:
        return None
    try:
        number = float(match.group(1))
        return number if number > 0 else None
    except ValueError:
        return None


def validate_cj_url(url):
    parsed = urlparse(url.strip())
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Vendos një URL të vlefshme të produktit CJ.")
    host = parsed.netloc.lower().split(":")[0]
    if not (host == "cjdropshipping.com" or host.endswith(".cjdropshipping.com")):
        raise ValueError("Për siguri, vendos një link nga cjdropshipping.com.")
    return url.strip()


def _is_cj_human_verification(page):
    """Return True only while CJ/Cloudflare is showing a human-check page."""
    try:
        title = (page.title() or "").lower()
        body = (page.locator("body").inner_text(timeout=2500) or "").lower()
        url = (page.url or "").lower()
    except Exception:
        return False

    indicators = (
        "human verification",
        "verify you are human",
        "checking your browser",
        "just a moment",
        "security verification",
        "complete the security check",
    )
    return (
        any(term in title or term in body for term in indicators)
        or "/cdn-cgi/challenge-platform/" in url
    )


def scrape_cj_product(url):
    """
    Opens CJ in a visible Google Chrome window. If CJ presents a human check,
    the user completes it manually in that window; this program does not solve
    or bypass CAPTCHA/Cloudflare challenges.
    """
    url = validate_cj_url(url)

    with sync_playwright() as p:
        # Use the locally installed Google Chrome so the user can see and
        # interact with CJ's page and complete any verification themselves.
        try:
            browser = p.chromium.launch(headless=False, channel="chrome")
        except Exception as exc:
            raise RuntimeError(
                "Nuk u gjet Google Chrome. Instalo Chrome dhe provo përsëri. "
                "Playwright duhet të hapë Chrome në mënyrën Headed."
            ) from exc

        try:
            context = browser.new_context(
                viewport={"width": 1440, "height": 1000},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/126.0.0.0 Safari/537.36"
                ),
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=90000)
            try:
                page.wait_for_load_state("networkidle", timeout=12000)
            except Exception:
                pass
            page.wait_for_timeout(2500)

            if _is_cj_human_verification(page):
                print(
                    "CJ kërkon Human verification. Plotësoje manualisht në "
                    "dritaren e Chrome; programi pret deri në 120 sekonda..."
                )
                try:
                    # Give the user a short initial window (15 seconds) and,
                    # if needed, continue waiting so a slower manual check can
                    # still finish without restarting product analysis.
                    page.wait_for_timeout(15000)
                    if _is_cj_human_verification(page):
                        page.wait_for_function(
                            """() => {
                                const title = (document.title || '').toLowerCase();
                                const body = (document.body?.innerText || '').toLowerCase();
                                const url = (location.href || '').toLowerCase();
                                const blocked = [
                                    'human verification',
                                    'verify you are human',
                                    'checking your browser',
                                    'just a moment',
                                    'security verification',
                                    'complete the security check'
                                ].some(term => title.includes(term) || body.includes(term));
                                return !blocked && !url.includes('/cdn-cgi/challenge-platform/');
                            }""",
                            timeout=105000,
                        )
                except Exception as exc:
                    raise RuntimeError(
                        "Verifikimi i CJ nuk u përfundua brenda 120 sekondave. "
                        "Provo përsëri dhe kliko vetë verifikimin në dritaren e Chrome."
                    ) from exc

            # Allow the actual product page and its gallery to finish rendering.
            page.wait_for_timeout(2500)
            if _is_cj_human_verification(page):
                raise RuntimeError(
                    "CJ ende po shfaq Human verification; titulli dhe fotot nuk u morën."
                )

            data = page.evaluate("""() => {
                const meta = (selector) =>
                    document.querySelector(selector)?.content || "";

                let title =
                    meta('meta[property="og:title"]') ||
                    meta('meta[name="title"]') ||
                    document.querySelector('h1')?.innerText ||
                    document.title || "";

                let price =
                    meta('meta[property="product:price:amount"]') ||
                    meta('meta[property="og:price:amount"]') ||
                    meta('meta[itemprop="price"]');

                const scripts = [...document.querySelectorAll(
                    'script[type="application/ld+json"]'
                )];
                for (const script of scripts) {
                    try {
                        const parsed = JSON.parse(script.textContent);
                        const nodes = Array.isArray(parsed) ? parsed :
                            (parsed['@graph'] ? parsed['@graph'] : [parsed]);
                        for (const node of nodes) {
                            const type = node['@type'];
                            if (
                                type === 'Product' ||
                                (Array.isArray(type) && type.includes('Product'))
                            ) {
                                title = title || node.name || "";
                                const offers = node.offers;
                                const offer = Array.isArray(offers) ? offers[0] : offers;
                                price = price || offer?.price || offer?.lowPrice || "";
                            }
                        }
                    } catch (_) {}
                }

                const imageCandidates = [];
                const ogImage = meta('meta[property="og:image"]');
                if (ogImage) imageCandidates.push(ogImage);

                for (const img of document.querySelectorAll('img')) {
                    const candidates = [
                        img.currentSrc,
                        img.src,
                        img.getAttribute('data-src'),
                        img.getAttribute('data-original'),
                        img.getAttribute('data-lazy-src')
                    ];
                    for (const candidate of candidates) {
                        if (candidate && /^https?:\\/\\//i.test(candidate)) {
                            imageCandidates.push(candidate);
                        }
                    }
                }

                for (const el of document.querySelectorAll(
                    '[data-src], [data-image], [data-zoom-image]'
                )) {
                    for (const attr of ['data-src', 'data-image', 'data-zoom-image']) {
                        const candidate = el.getAttribute(attr);
                        if (candidate && /^https?:\\/\\//i.test(candidate)) {
                            imageCandidates.push(candidate);
                        }
                    }
                }

                return {
                    title: String(title).trim(),
                    price: String(price || "").trim(),
                    images: [...new Set(imageCandidates)]
                };
            }""")

            title_lower = (data.get("title") or "").lower()
            if any(term in title_lower for term in (
                "human verification", "just a moment", "security verification"
            )):
                raise RuntimeError(
                    "CJ nuk dha titull produkti; faqja duket ende si verifikim sigurie."
                )

        finally:
            browser.close()

    # Filter out common UI assets and duplicate image URLs.
    filtered = []
    for image_url in data.get("images", []):
        lower = image_url.lower()
        if any(term in lower for term in ("logo", "avatar", "icon", "flag", "sprite")):
            continue
        if image_url not in filtered:
            filtered.append(image_url)

    if not data.get("title"):
        raise RuntimeError(
            "Nuk u lexua titulli i produktit pas verifikimit. Kontrollo faqen CJ dhe provo përsëri."
        )
    if not filtered:
        raise RuntimeError(
            "Nuk u gjetën fotografi të produktit. Kontrollo që galeria të jetë ngarkuar në Chrome dhe provo përsëri."
        )

    return {
        "title": data["title"],
        "price": parse_price(data.get("price")),
        "images": filtered,
    }


class HeinzeManager(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Heinze Filter | Product Manager")
        self.geometry("1120x900")
        self.minsize(900, 700)

        self.access_token = None
        self.refresh_token = None
        self.product_images = []
        self.thumbnail_refs = []
        self.busy = False

        self._build_ui()

    def _build_ui(self):
        header = ctk.CTkFrame(self, corner_radius=14)
        header.pack(fill="x", padx=18, pady=(18, 10))
        ctk.CTkLabel(
            header, text="HEINZE FILTER",
            font=ctk.CTkFont(size=27, weight="bold")
        ).pack(pady=(14, 2))
        ctk.CTkLabel(
            header, text="PRODUCT MANAGER  •  CJ DROPSHIPPING → SUPABASE",
            text_color="gray"
        ).pack(pady=(0, 14))

        login = ctk.CTkFrame(self, corner_radius=12)
        login.pack(fill="x", padx=18, pady=6)
        ctk.CTkLabel(login, text="Supabase login", font=ctk.CTkFont(weight="bold")).pack(
            anchor="w", padx=12, pady=(10, 3)
        )
        login_row = ctk.CTkFrame(login, fg_color="transparent")
        login_row.pack(fill="x", padx=10, pady=(2, 10))
        self.email_entry = ctk.CTkEntry(login_row, placeholder_text="Email i Supabase", width=280)
        self.email_entry.pack(side="left", padx=5)
        self.password_entry = ctk.CTkEntry(
            login_row, placeholder_text="Fjalëkalimi", show="*", width=240
        )
        self.password_entry.pack(side="left", padx=5)
        self.login_button = ctk.CTkButton(
            login_row, text="Hyr në Supabase", command=self.login
        )
        self.login_button.pack(side="left", padx=5)

        url_frame = ctk.CTkFrame(self, corner_radius=12)
        url_frame.pack(fill="x", padx=18, pady=6)
        ctk.CTkLabel(url_frame, text="Linku i produktit nga CJ").pack(
            anchor="w", padx=12, pady=(10, 3)
        )
        self.url_entry = ctk.CTkEntry(
            url_frame, height=40,
            placeholder_text="Ngjit këtu URL-në e produktit CJ Dropshipping"
        )
        self.url_entry.pack(fill="x", padx=12, pady=5)
        self.analyze_button = ctk.CTkButton(
            url_frame, text="ANALIZO PRODUKTIN", height=40,
            command=self.analyze
        )
        self.analyze_button.pack(fill="x", padx=12, pady=(5, 12))

        details = ctk.CTkFrame(self, corner_radius=12)
        details.pack(fill="x", padx=18, pady=6)
        ctk.CTkLabel(details, text="Të dhënat e produktit", font=ctk.CTkFont(weight="bold")).pack(
            anchor="w", padx=12, pady=(10, 3)
        )

        self.title_entry = ctk.CTkEntry(
            details, height=38, placeholder_text="Titulli në gjermanisht"
        )
        self.title_entry.pack(fill="x", padx=12, pady=5)

        price_row = ctk.CTkFrame(details, fg_color="transparent")
        price_row.pack(fill="x", padx=7, pady=(2, 10))
        self.price_entry = ctk.CTkEntry(
            price_row, placeholder_text="Çmimi i shitjes (€)", width=220
        )
        self.price_entry.pack(side="left", padx=5, fill="x", expand=True)
        self.old_price_entry = ctk.CTkEntry(
            price_row, placeholder_text="Çmimi i vjetër (€)", width=220
        )
        self.old_price_entry.pack(side="left", padx=5, fill="x", expand=True)
        self.category_entry = ctk.CTkEntry(
            price_row, placeholder_text="Kategoria", width=300
        )
        self.category_entry.insert(0, "Duschen & Duschsysteme")
        self.category_entry.pack(side="left", padx=5, fill="x", expand=True)

        gallery_header = ctk.CTkFrame(self, fg_color="transparent")
        gallery_header.pack(fill="x", padx=22, pady=(8, 2))
        ctk.CTkLabel(
            gallery_header, text="GALERIA E FOTOGRAFIVE",
            font=ctk.CTkFont(size=16, weight="bold")
        ).pack(side="left")
        self.gallery_count = ctk.CTkLabel(gallery_header, text="0 fotografi", text_color="gray")
        self.gallery_count.pack(side="right")

        self.gallery = ctk.CTkScrollableFrame(self, height=260, corner_radius=12)
        self.gallery.pack(fill="both", expand=True, padx=18, pady=5)

        self.status_label = ctk.CTkLabel(self, text="Gati. Hyr në Supabase dhe analizo një produkt.")
        self.status_label.pack(fill="x", padx=20, pady=5)

        self.publish_button = ctk.CTkButton(
            self, text="PUBLIKO NË SUPABASE", height=52,
            font=ctk.CTkFont(size=17, weight="bold"),
            fg_color="#16834A", hover_color="#116B3C",
            command=self.publish
        )
        self.publish_button.pack(fill="x", padx=18, pady=(5, 18))

    def set_status(self, message, color=None):
        def update():
            self.status_label.configure(text=message, text_color=color or ("gray" if self._fg_color == "gray" else None))
        self.after(0, update)

    def set_busy(self, busy, status=None):
        self.busy = busy
        def update():
            state = "disabled" if busy else "normal"
            self.analyze_button.configure(state=state)
            self.publish_button.configure(state=state)
            self.login_button.configure(state=state)
            if status:
                self.status_label.configure(text=status)
        self.after(0, update)

    def login(self):
        email = self.email_entry.get().strip()
        password = self.password_entry.get()
        if not email or not password:
            self.status_label.configure(text="Shkruaj emailin dhe fjalëkalimin Supabase.", text_color="red")
            return
        self.set_busy(True, "Duke u lidhur me Supabase...")
        threading.Thread(target=self._login_worker, args=(email, password), daemon=True).start()

    def _login_worker(self, email, password):
        try:
            response = requests.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
                json={"email": email, "password": password},
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            payload = response.json()
            self.access_token = payload["access_token"]
            self.refresh_token = payload.get("refresh_token")
            self.set_busy(False, "U lidhe me Supabase me sukses.")
            self.after(0, lambda: self.status_label.configure(text_color="#16834A"))
        except Exception as exc:
            self.set_busy(False, f"Hyrja dështoi: {exc}")
            self.after(0, lambda: self.status_label.configure(text_color="red"))

    def analyze(self):
        if self.busy:
            return
        url = self.url_entry.get().strip()
        if not url:
            self.status_label.configure(text="Ngjit linkun e produktit CJ.", text_color="red")
            return
        self.set_busy(True, "Duke analizuar faqen CJ. Kjo mund të zgjasë pak...")
        threading.Thread(target=self._analyze_worker, args=(url,), daemon=True).start()

    def _analyze_worker(self, url):
        try:
            result = scrape_cj_product(url)
            self.after(0, lambda: self._load_product(result))
            self.set_busy(False, f"U gjetën {len(result['images'])} fotografi. Kontrolloji dhe hiq ato që nuk i dëshiron.")
        except Exception as exc:
            self.set_busy(False, f"Analiza dështoi: {exc}")
            self.after(0, lambda: self.status_label.configure(text_color="red"))

    def _load_product(self, product):
        self.title_entry.delete(0, "end")
        self.title_entry.insert(0, product["title"])

        self.price_entry.delete(0, "end")
        if product["price"] is not None:
            self.price_entry.insert(0, f"{product['price']:.2f}")

        # Keep "Çmimi i vjetër" empty by default. If it remains blank,
        # publish() sends None and Supabase receives JSON null.
        self.old_price_entry.delete(0, "end")

        self.product_images = list(product["images"])
        self._render_gallery()

    def _render_gallery(self):
        for child in self.gallery.winfo_children():
            child.destroy()
        self.thumbnail_refs.clear()

        for index, image_url in enumerate(self.product_images):
            row = ctk.CTkFrame(self.gallery, corner_radius=9)
            row.pack(fill="x", padx=5, pady=5)

            try:
                response = requests.get(
                    image_url, timeout=20,
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                response.raise_for_status()
                image = Image.open(BytesIO(response.content)).convert("RGB")
                image.thumbnail((100, 85))
                thumb = ctk.CTkImage(light_image=image, dark_image=image, size=(100, 85))
                self.thumbnail_refs.append(thumb)
                ctk.CTkLabel(row, image=thumb, text="").pack(side="left", padx=8, pady=6)
            except Exception:
                ctk.CTkLabel(row, text="Pamja nuk u ngarkua", width=110).pack(side="left", padx=8)

            ctk.CTkLabel(
                row, text=f"Foto {index + 1}",
                anchor="w"
            ).pack(side="left", padx=8, fill="x", expand=True)

            ctk.CTkButton(
                row, text="X", width=38, fg_color="#B3261E",
                hover_color="#8C1D18",
                command=lambda url=image_url: self.remove_image(url)
            ).pack(side="right", padx=10, pady=8)

        self.gallery_count.configure(text=f"{len(self.product_images)} fotografi")

    def remove_image(self, image_url):
        if image_url in self.product_images:
            self.product_images.remove(image_url)
        self._render_gallery()
        self.status_label.configure(text="Fotografia u hoq nga lista e publikimit.", text_color="orange")

    def _auth_headers(self, content_type=None):
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {self.access_token}",
        }
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def _upload_image(self, image_url, index):
        response = requests.get(
            image_url, timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        response.raise_for_status()

        if len(response.content) > MAX_IMAGE_BYTES:
            raise ValueError("Një fotografi është më e madhe se 15 MB.")

        content_type = response.headers.get("Content-Type", "").split(";")[0].lower()
        if content_type not in SUPPORTED_IMAGE_TYPES:
            # Verify bytes using Pillow if the remote server reports a generic type.
            try:
                im = Image.open(BytesIO(response.content))
                fmt = (im.format or "").upper()
                content_type = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}.get(fmt, "")
            except Exception:
                content_type = ""

        if content_type not in SUPPORTED_IMAGE_TYPES:
            raise ValueError(f"Formati i fotografisë nuk mbështetet: {content_type or 'i panjohur'}")

        extension = SUPPORTED_IMAGE_TYPES[content_type]
        object_path = f"{uuid.uuid4().hex}_{index}.{extension}"
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{object_path}"

        upload = requests.post(
            upload_url,
            headers={
                **self._auth_headers(content_type),
                "x-upsert": "false",
            },
            data=response.content,
            timeout=REQUEST_TIMEOUT
        )
        upload.raise_for_status()

        return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{object_path}"

    def publish(self):
        if self.busy:
            return
        if not self.access_token:
            self.status_label.configure(text="Së pari hyr në Supabase.", text_color="red")
            return

        title = self.title_entry.get().strip()
        category = self.category_entry.get().strip()
        images = list(self.product_images)

        try:
            price = float(self.price_entry.get().strip().replace(",", "."))
            old_price_text = self.old_price_entry.get().strip().replace(",", ".")
            old_price = float(old_price_text) if old_price_text else None
            if price <= 0 or (old_price is not None and old_price <= 0):
                raise ValueError
        except ValueError:
            self.status_label.configure(text="Kontrollo çmimin dhe çmimin e vjetër.", text_color="red")
            return

        if not title or not category or not images:
            self.status_label.configure(text="Plotëso titullin, kategorinë dhe mbaj të paktën një fotografi.", text_color="red")
            return

        self.set_busy(True, "Duke ngarkuar fotografitë dhe produktin në Supabase...")
        threading.Thread(
            target=self._publish_worker,
            args=(title, price, old_price, category, images),
            daemon=True
        ).start()

    def _publish_worker(self, title, price, old_price, category, images):
        try:
            public_urls = []
            for index, image_url in enumerate(images, start=1):
                public_urls.append(self._upload_image(image_url, index))

            # linku_fotos is TEXT in the existing table. Store a JSON array
            # so the storefront can display a gallery; older single URLs remain valid.
            product_data = {
                "titulli": title,
                "cmimi": round(price, 2),
                "cmimi_vjetor": round(old_price, 2) if old_price is not None else None,
                "kategoria": category,
                "linku_fotos": json.dumps(public_urls, ensure_ascii=False),
            }

            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/produkte",
                headers={
                    **self._auth_headers("application/json"),
                    "Prefer": "return=representation",
                },
                json=product_data,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            self.set_busy(False, "Produkti u publikua me sukses në Supabase!")
            self.after(0, lambda: self.status_label.configure(text_color="#16834A"))
        except requests.HTTPError as exc:
            detail = ""
            try:
                detail = exc.response.text[:700]
            except Exception:
                pass
            self.set_busy(False, f"Publikimi dështoi: {detail or exc}")
            self.after(0, lambda: self.status_label.configure(text_color="red"))
        except Exception as exc:
            self.set_busy(False, f"Publikimi dështoi: {exc}")
            self.after(0, lambda: self.status_label.configure(text_color="red"))


if __name__ == "__main__":
    app = HeinzeManager()
    app.mainloop()
