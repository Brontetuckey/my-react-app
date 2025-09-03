
import sha256 from "js-sha256";

const clientId = "7018b4d435e845db9acf972b8232cfe4";
const redirectUri = "http://127.0.0.1:5173/";

let accessToken = null;
let tokenExpirationTime = 0;

const generateRandomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const base64UrlEncode = (str) =>
  btoa(String.fromCharCode.apply(null, str))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const Spotify = {
  async getAccessToken() {
    if (accessToken && Date.now() < tokenExpirationTime) return accessToken;

    const storedToken = localStorage.getItem("spotify_access_token");
    const storedExpiry = localStorage.getItem("spotify_token_expiry");
    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      accessToken = storedToken;
      tokenExpirationTime = parseInt(storedExpiry);
      return accessToken;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const codeVerifier = localStorage.getItem("spotify_code_verifier");

      const body = new URLSearchParams();
      body.append("client_id", clientId);
      body.append("grant_type", "authorization_code");
      body.append("code", code);
      body.append("redirect_uri", redirectUri);
      body.append("code_verifier", codeVerifier);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        accessToken = data.access_token;
        tokenExpirationTime = Date.now() + data.expires_in * 1000;

        localStorage.setItem("spotify_access_token", accessToken);
        localStorage.setItem("spotify_token_expiry", tokenExpirationTime.toString());

        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);

        // Restore previous search term if it was saved
        const savedSearch = localStorage.getItem("last_search_query");
        if (savedSearch) {
          setTimeout(() => {
            const searchEvent = new CustomEvent("spotify-restored-search", { detail: savedSearch });
            window.dispatchEvent(searchEvent);
          }, 100);
        }

        return accessToken;
      }
    }

    const codeVerifier = generateRandomString(128);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const codeChallenge = base64UrlEncode(new Uint8Array(sha256.arrayBuffer(codeVerifier)));
    const scope = ["playlist-modify-public", "playlist-modify-private", "user-read-private"];

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scope.join(" ")
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

    window.location = authUrl;
  },

  async search(query) {
    if (!query) return [];
    localStorage.setItem("last_search_query", query);

    const token = await this.getAccessToken();
    if (!token) return [];

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();

    if (!data.tracks) return [];
    return data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      uri: track.uri,
      preview: track.preview_url, // 🎵 preview sample
    }));
  },

  async savePlaylist(name, uris) {
    if (!name || !uris.length) return;
    const token = await this.getAccessToken();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const profileRes = await fetch("https://api.spotify.com/v1/me", { headers });
    const userId = (await profileRes.json()).id;

    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, public: false }),
    });
    const playlistId = (await playlistRes.json()).id;

    await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ uris }),
    });

    console.log("✅ Playlist saved!");
  },
};

export default Spotify;