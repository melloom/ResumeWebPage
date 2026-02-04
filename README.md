# 👋 Hey, I'm Melvin

**Full-Stack Developer** • **AI Integrator** • **Builder**

A modern, responsive portfolio that screams "I code with vision, vibes, and velocity." Built from scratch because why use a template when you can build something uniquely yours? ✨

---

## 🌐 Live Site

**👉 [mellowsites.com](https://mellowsites.com/)**

Check it out, break things, send feedback. I'm always down to chat.

---

## 🔗 Project Live Sites

Links to all projects featured on the portfolio:

| Project | Live Site |
|---------|-----------|
| **MellowQuote** | [mellowquote.netlify.app](https://mellowquote.netlify.app) |
| **If I Was Honest** | [thehonestproject.netlify.app](https://thehonestproject.netlify.app) |
| **WiredLiving Blog** | [wiredliving.vercel.app](https://wiredliving.vercel.app) |
| **RocketRAM** | [rocketram.netlify.app](https://rocketram.netlify.app) |
| **Vocalix** | [vocalix.netlify.app](https://vocalix.netlify.app) |
| **Long Home** | [2026longhome.netlify.app](https://2026longhome.netlify.app) |
| **Long Home Confirmation Helper** | [quickconfirm.netlify.app](https://quickconfirm.netlify.app) |
| **GhostInbox** | [ghost-inbox.vercel.app](https://ghost-inbox.vercel.app) |
| **BrandSaaS** | [brandsaas.netlify.app](https://brandsaas.netlify.app) |
| **Personal Portfolio** | [melvinworks.netlify.app](https://melvinworks.netlify.app) |
| **CloseLoop Training Platform** | [closeloop.netlify.app](https://closeloop.netlify.app) |
| **Lockora Password Generator** | [lockora.netlify.app](https://lockora.netlify.app) |
| **MelHub Social Links** | [melhub.netlify.app](https://melhub.netlify.app) |
| **NumixPro Calculator** | [numixpro.netlify.app](https://numixpro.netlify.app) |
| **Would You Rather Survival** | [wouldyouratherio.netlify.app](https://wouldyouratherio.netlify.app) |
| **Rosie's Kitchen** | [rosiekitchen.netlify.app](https://rosiekitchen.netlify.app) |
| **FlavorHaven Demo** | [flavorhavendemo.netlify.app](https://flavorhavendemo.netlify.app) |
| **Tony's Pizza Shack** | [pizzashopdemos.netlify.app](https://pizzashopdemos.netlify.app) |

---

## 🎯 What's This About?

This isn't just another portfolio site. This is my digital home—a space where I showcase:

- 💼 **My Work**: Real projects that solve real problems
- 🚀 **My Skills**: The tools I use to build things fast
- 🎨 **My Style**: Clean code, smooth animations, zero BS
- 🤝 **My Story**: Who I am, what I've done, where I'm going

Think of it as a resume that actually doesn't suck to read. Plus it's a PWA, so you can install it on your phone. Fancy, right? 📱

---

## ⚡ What Makes This Special?

### Built for Speed
- ⚡ **Vite-powered** - Lightning fast dev server and builds
- 🚀 **Optimized Performance** - Lazy loading, code splitting, all that good stuff
- 📱 **Progressive Web App** - Install it, use it offline, feel like a pro

### Built for Users
- 🌓 **Dark/Light Mode** - Because your eyes matter (and system preferences are cool)
- ♿ **Accessible AF** - WCAG 2.1 compliant, keyboard navigation, screen reader friendly
- 📱 **Fully Responsive** - Looks good on everything from a potato phone to a 4K monitor
- 🎭 **Smooth Animations** - Framer Motion makes everything feel buttery smooth

### Built for Real
- 📧 **Contact Forms** - EmailJS integration (no backend needed, zero hassle)
- 📅 **Calendly Integration** - Book meetings without the back-and-forth
- 🔥 **Firebase Backend** - Dynamic project management, real-time updates
- 📊 **Analytics Ready** - Track what matters, ignore what doesn't

---

## 🛠️ The Tech Stack (The Good Stuff)

I'm not here to flex, but this stack is solid:

- **React 18.2** - Because hooks are life
- **Vite 6.3** - The build tool that makes Webpack cry
- **Firebase** - Backend as a service done right
- **Framer Motion** - Animations that don't make your laptop sound like a jet
- **React Router** - Routing that actually makes sense
- **EmailJS** - Contact forms without the backend headache
- **PWA Plugin** - Offline-first, installable, modern web app

**Styling?** CSS Modules + SASS + custom CSS variables. No framework bloat, just clean, maintainable styles.

---

## 🚀 Quick Start (Let's Build Something)

### Prerequisites

You'll need:
- **Node.js** 14+ (but let's be real, use 18+)
- **npm** or **yarn** (your call)
- **Git** (obviously)

### Installation

```bash
# Clone this bad boy
git clone https://github.com/melloom/ResumeWebPage.git
cd ResumeWebPage

# Install the dependencies
npm install

# Set up your environment variables
cp .env.example .env
# Then edit .env with your actual keys (see below)

# Start the dev server
npm run dev
```

Boom. Open [http://localhost:5173](http://localhost:5173) and watch the magic happen. ✨

### Environment Variables

You'll need to set these up in your `.env` file:

```env
# Firebase (get these from Firebase Console)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# EmailJS (get these from EmailJS dashboard)
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
```

**⚠️ Important:** Never commit your `.env` file. It's in `.gitignore` for a reason. Trust me on this one.

---

## 📦 Project Structure

```
my-resume-website/
├── public/              # Static assets (icons, images, etc.)
│   ├── icons/          # Favicons and PWA icons
│   ├── screenshots/    # Project thumbnails
│   └── Vocalix.png     # Featured project image 🎙️
│
├── src/
│   ├── components/     # React components (organized by feature)
│   │   ├── about/      # About page components
│   │   ├── contact/    # Contact form & info
│   │   ├── home/       # Home page sections
│   │   ├── projects/   # Project showcase
│   │   └── resume/     # Resume page
│   │
│   ├── config/         # Configuration (Firebase, EmailJS)
│   ├── context/        # React Context (Auth, Theme)
│   ├── data/           # Static data (experience, education)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── utils/          # Helper functions
│
├── scripts/            # Build scripts and utilities
└── package.json        # Dependencies (obviously)
```

Clean, organized, easy to navigate. Just how I like it.

---

## 🎨 Customization (Make It Yours)

### Personal Info

1. **Experience & Education**: Edit `src/data/experienceData.js` and `src/data/educationData.js`
2. **Projects**: Add your own in `src/components/projects/ProjectList/ProjectList.jsx`
3. **Profile Images**: Drop your pics in `public/images/`
4. **Screenshots**: Add project thumbnails to `public/screenshots/`

### Styling

- **Colors**: Edit CSS variables in `src/index.css`
- **Fonts**: Update imports in `index.html`
- **Components**: Each component has its own CSS module - go wild

### Features

Want to add something? Fork it, build it, make it better. That's the beauty of open source.

---

## 🚢 Deployment (Get It Live)

### Netlify (Recommended - It's What I Use)

1. Push to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard
6. Deploy. Done.

### Vercel

Same process, different platform. You do you.

### GitHub Pages

Possible but requires some config tweaks. Not recommended unless you're into that.

---

## 📝 Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Lint your code (don't skip this)
npm run push     # Build, commit, push, and deploy (one command FTW)
```

---

## 🔒 Security

This repo is secure. No hardcoded secrets, all keys in environment variables, proper `.gitignore` setup. If you find a vulnerability, hit me up (responsibly, please).

Check out `SECURITY.md` for more details.

---

## 🤝 Contributing

Found a bug? Have an idea? Want to make it better?

1. Fork it
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Let's build something cool together.

---

## 📄 License

MIT License - Use it, modify it, make it yours. Just give credit where credit is due.

---

## 💬 Let's Connect

- **GitHub**: [@melloom](https://github.com/melloom)
- **Portfolio**: [mellowsites.com](https://mellowsites.com/)
- **Projects**: Check out my other work in the Projects section

---

## 🙏 Shoutouts

Big love to the open-source community and the tools that make this possible:

- [React](https://reactjs.org/) - The library that changed everything
- [Vite](https://vitejs.dev/) - The build tool that just works
- [Framer Motion](https://www.framer.com/motion/) - Animations made easy
- [Firebase](https://firebase.google.com/) - Backend without the backend
- [Netlify](https://www.netlify.com/) - Hosting that's actually good

---

## ⭐ Show Some Love

If you like what you see, give it a star. It makes my day. ⭐

---

<div align="center">

**Built with ❤️ by Melvin Peralta**

*"Code with vision, vibes, and velocity."*

[🌐 Live Site](https://mellowsites.com/) • [💻 GitHub](https://github.com/melloom) • [📧 Contact](https://mellowsites.com/contact)

</div>
