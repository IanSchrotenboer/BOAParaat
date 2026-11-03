// Account verwijderen (AVG): de ingelogde gebruiker verwijdert zijn eigen account.
// De rij in 'voortgang' gaat automatisch mee (on delete cascade).
// verify_jwt staat uit: de functie controleert het toegangsbewijs zelf via auth.getUser (werkt ook met de
// nieuwe ondertekeningssleutels van Supabase).
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const antwoord = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return antwoord(405, { error: "alleen POST" });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return antwoord(401, { error: "niet ingelogd" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return antwoord(401, { error: "niet ingelogd" });
  const { error: fout } = await admin.auth.admin.deleteUser(data.user.id);
  if (fout) return antwoord(500, { error: "verwijderen mislukt" });
  return antwoord(200, { verwijderd: true });
});
