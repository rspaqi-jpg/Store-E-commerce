import { NextResponse } from "next/server";
export const dynamic="force-static";
const products=[
{_id:"1",name:"Filter-Duschkopf",category:"neuheiten",price:29.90,description:"Moderner Duschkopf mit austauschbarem Filter.",imageUrl:"https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80"},
{_id:"2",name:"LED-Nachtlicht mit Bewegungssensor",category:"technik",price:19.90,description:"Kompaktes LED-Licht für Flur und Badezimmer.",imageUrl:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"},
{_id:"3",name:"Organizer für das Badezimmer",category:"wohnen",price:24.90,description:"Praktische Aufbewahrung für Bad und Dusche.",imageUrl:"https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80"}];
export async function GET(){return NextResponse.json(products,{headers:{"Cache-Control":"public, max-age=300"}})}
