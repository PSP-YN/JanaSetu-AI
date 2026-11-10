import type { MetadataRoute } from "next";
const sitemap="https://jana-setu-ai.vercel.app/sitemap.xml";
const disallow=["/api/","/app","/app/"];
export default function robots():MetadataRoute.Robots{
 return {
  rules:[
   {userAgent:"*",allow:"/",disallow},
   {userAgent:"OAI-SearchBot",allow:"/",disallow},
   {userAgent:"PerplexityBot",allow:"/",disallow},
   {userAgent:"Claude-SearchBot",allow:"/",disallow}
  ],
  sitemap
 };
}
