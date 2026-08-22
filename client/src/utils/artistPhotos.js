// Automatically bundle and map all image assets in src/assets/images/
const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
  import: "default",
});

const getAssetImg = (filenameWithoutExt) => {
  const target = filenameWithoutExt.toLowerCase().replace(/[-_ ]/g, "");
  for (const path in imageModules) {
    const fileName = path.split("/").pop().toLowerCase();
    const nameOnly = fileName.substring(0, fileName.lastIndexOf(".")).replace(/[-_ ]/g, "");
    if (nameOnly === target) {
      return imageModules[path];
    }
  }
  return null;
};

// Local image filename mapping
export const ARTIST_LOCAL_MAP = {
  // Top Music Directors & Composers
  "anirudh ravichander": "anirudh",
  "anirudh": "anirudh",
  "a.r. rahman": "ar_rahman",
  "ar rahman": "ar_rahman",
  "rahman": "ar_rahman",
  "sai abhyankkar": "sai_abhyankkar",
  "sai": "sai_abhyankkar",
  "g.v. prakash kumar": "gv_prakash",
  "g.v. prakash": "gv_prakash",
  "gv prakash": "gv_prakash",
  "harris jayaraj": "harris_jayaraj",
  "santhosh narayanan": "santhosh_narayanan",
  "sean roldan": "sean_roldan",
  "yuvan shankar raja": "yuvan",
  "yuvan": "yuvan",
  "thaman s": "thaman_s",
  "s. thaman": "thaman_s",
  "thaman": "thaman_s",
  "shashwat sachdev": "shashwat_sachdev",
  "hiphop tamizha": "hiphop-tamizha",
  "hiphop tamizha aadhi": "hiphop-tamizha",
  "jakes bejoy": "jakes_bejoy",
  "jakes": "jakes_bejoy",

  // Singers & Performers
  "arijit singh": "arijit_singh",
  "shreya ghoshal": "shreya_ghoshal",
  "sid sriram": "sid_sriram",
  "asal kolaar": "asal_kolaar",
  "asal kolar": "asal_kolaar",

  // Actors & Artists
  "dhanush": "dhanush",
  "vijay thalapathy": "vijay_thalapathy",
  "thalapathy vijay": "vijay_thalapathy",
  "thalapathy": "vijay_thalapathy",
  "vijay": "vijay_thalapathy",
  "pa. vijay": "pa_vijay",
  "pa vijay": "pa_vijay",
  "mohan rajan": "mohan_rajan"
};

// Formats display title consistently
export const normalizeArtistDisplayName = (name) => {
  if (!name) return "";
  const clean = name.toLowerCase().trim();
  if (clean === "vijay" || clean === "thalapathy" || clean === "thalapathy vijay") {
    return "Vijay Thalapathy";
  }
  if (clean === "anirudh") return "Anirudh Ravichander";
  if (clean === "sai") return "Sai Abhyankkar";
  if (clean === "gv prakash" || clean === "g.v. prakash") return "G.V. Prakash Kumar";
  if (clean === "ar rahman") return "A.R. Rahman";
  if (clean === "yuvan") return "Yuvan Shankar Raja";
  return name.trim();
};

export const resolveArtistImage = (name, customImg, songCover) => {
  const clean = (name || "").toLowerCase().trim();

  if (ARTIST_LOCAL_MAP[clean]) {
    const asset = getAssetImg(ARTIST_LOCAL_MAP[clean]);
    if (asset) return asset;
  }

  for (const [key, fileBase] of Object.entries(ARTIST_LOCAL_MAP)) {
    if (clean === key) {
      const asset = getAssetImg(fileBase);
      if (asset) return asset;
    }
  }

  if (
    customImg &&
    typeof customImg === "string" &&
    customImg.startsWith("http") &&
    !customImg.includes("localhost:5173/uploads") &&
    !customImg.includes("placeholder")
  ) {
    return customImg;
  }

  if (
    songCover &&
    typeof songCover === "string" &&
    songCover.startsWith("http") &&
    !songCover.includes("localhost:5173/uploads")
  ) {
    return songCover;
  }

  return null;
};