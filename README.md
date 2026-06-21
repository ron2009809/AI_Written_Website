# ConnectHub Social Media

A modern, responsive social media web app with login/signup, feed, friends, messaging, profile management, and more.

## Live Demo

- **GitHub Pages:** https://ron2009809.github.io/AI_Written_Website/
- **Netlify:** https://delicate-halva-13064c.netlify.app/ (anonymous deploy password: `My-Drop-Site` — claim the site on Netlify to remove the password)

## Demo Account

- **Username:** `alexm`
- **Password:** `demo1234`

Or create a new account via Sign Up.

## Features

- Login & Sign Up (email, name, username, phone, password)
- Home feed with posts and videos
- Search users, posts, and content
- Friends feed with stories
- Upload photos and videos
- Messages with notifications (likes, comments, follows)
- Profile editing (avatar, cover, bio, stats)
- Like, comment, share, save, delete, edit caption
- Follow/unfollow with private account support
- Settings: language (EN/ZH/KO/JA/ES/FR), password change, theme, privacy
- Profile view tracking
- Responsive design for mobile, tablet, and desktop

## Database

Data is stored in the browser's localStorage (client-side database). Each browser maintains its own data. Demo seed data is included on first load.

## Local Development

Open `index.html` in a browser, or run a local server:

```bash
cd social-media
python -m http.server 8080
```

Visit http://localhost:8080

## Deploy to GitHub Pages

Push this folder to a GitHub repo and enable Pages from the `main` branch root.

## Deploy to Netlify

Drag the `social-media` folder to [Netlify Drop](https://app.netlify.com/drop) or connect your repo with publish directory set to `social-media`.
