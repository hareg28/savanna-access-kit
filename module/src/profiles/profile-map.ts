export type ProfileKey = "cantSee" | "cantHear" | "lowData" | "hardToRead";

export interface ProfileChanges {
  ui?: {
    theme?: "dark" | "light" | "high-contrast";
    shortcuts?: boolean;
    speed?: number;
    lang?: "en" | "am";
  };
  captions?: {
    enabled?: boolean;
    fontSize?: number;
    preset?: "white-black" | "yellow-black" | "black-white" | "custom";
    lang?: "en" | "am" | "off";
    position?: "bottom" | "top";
  };
  sign?: {
    enabled?: boolean;
    corner?: "nw" | "ne" | "se" | "sw";
  };
  ad?: {
    enabled?: boolean;
    mode?: "audio" | "text";
  };
  offline?: {
    preferPack?: boolean;
  };
}

export const PROFILE_MAP: Record<ProfileKey, (pageLang: "en" | "am") => ProfileChanges> = {
  cantSee: () => ({
    ad: { enabled: true, mode: "audio" },
    ui: { shortcuts: true, theme: "dark" },
  }),
  cantHear: (pageLang) => ({
    captions: {
      enabled: true,
      lang: pageLang,
      fontSize: 150,
      preset: "yellow-black",
    },
    sign: { enabled: true },
  }),
  lowData: () => ({
    offline: { preferPack: true },
  }),
  hardToRead: () => ({
    captions: {
      enabled: true,
      fontSize: 200,
    },
    ui: {
      theme: "high-contrast",
    },
  }),
};
