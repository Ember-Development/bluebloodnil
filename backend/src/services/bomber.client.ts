// bomber.client.ts
import axios from "axios";

export const bomberClient = axios.create({
  baseURL: process.env.BOMBER_API_URL, // e.g. http://localhost:4000/api
});

// Matches Bomber's controller: { success, count, data }
export type BomberNilAthlete = {
  id: string;
  jerseyNum: string;
  pos1: string;
  pos2: string;
  ageGroup: string;
  gradYear: string;
  college: string | null;
  user: {
    id: string;
    email: string;
    fname: string;
    lname: string;
  };
  team: {
    id: string;
    name: string;
    ageGroup: string;
    region: string;
    state: string;
  } | null;
  address?: {
    id: string;
    address1: string;
    address2?: string | null;
    city: string;
    state: string;
    zip: string;
  } | null;
  parents: {
    id: string;
    user: {
      fname: string;
      lname: string;
      email: string | null;
      phone: string | null;
    };
  }[];
};

export type BomberNilResponse = {
  success: boolean;
  count: number;
  data: BomberNilAthlete[];
};

export async function fetchNilAthletesFromBomber() {
  const { data } = await bomberClient.get<BomberNilResponse>(
    "/integrations/nil-athletes",
    {
      headers: {
        Authorization: `Bearer ${process.env.BOMBER_INTEGRATION_API_KEY!}`,
      },
    }
  );

  return data.data; // this is BomberNilAthlete[]
}

// Matches Bomber's admin integration endpoint response
// Now returns users directly with primaryRole === 'ADMIN'
export type BomberAdmin = {
  id: string;
  email: string;
  fname: string;
  lname: string;
  phone: string | null;
  primaryRole: string;
  emailVerification: boolean;
};

export type BomberAdminResponse = {
  success: boolean;
  count: number;
  data: BomberAdmin[];
};

export async function fetchAdminsFromBomber() {
  const { data } = await bomberClient.get<BomberAdminResponse>(
    "/integrations/admins",
    {
      headers: {
        Authorization: `Bearer ${process.env.BOMBER_INTEGRATION_API_KEY!}`,
      },
    }
  );

  return data.data; // this is BomberAdmin[]
}
