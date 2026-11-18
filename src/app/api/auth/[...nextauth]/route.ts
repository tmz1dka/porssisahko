// Auth.js:n omat osoitteet (kirjautuminen, uloskirjautuminen, istunnon
// tarkistus). Next.js ohjaa kaikki /api/auth/... -pyynnöt tänne.
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
