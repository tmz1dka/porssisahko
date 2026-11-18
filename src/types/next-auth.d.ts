// Auth.js:n omien tyyppien täydennys. Oletuksena istunto ei tiedä roolista
// mitään, joten kerrotaan TypeScriptille, että istunnossa on myös rooli ja
// tunniste. Näin roolin käyttö sivuilla on tyypitettyä eikä arvausta.
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
    };
  }
}

// Istunnon sisältö evästeessä (JWT). Täydennys tehdään moduuliin
// "@auth/core/jwt" eikä "next-auth/jwt", koska jälkimmäinen vain
// uudelleenvie tyypit – täydennys ei silloin yhdistyisi alkuperäiseen.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
