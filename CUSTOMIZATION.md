# Quick Customization Checklist

Use this checklist to quickly personalize your portfolio website.

## Essential Updates (Do These First!)

- [ ] **Personal Name/Brand**: Update "Your Portfolio" in navbar (index.html, line 13)
- [ ] **Hero Title**: Change "Creative & Technical Solutions" (index.html, line 30)
- [ ] **Email**: Update email address (index.html, line 234)
- [ ] **Phone**: Update phone number (index.html, line 235)
- [ ] **Location**: Update your city and country (index.html, line 236)
- [ ] **Social Links**: Add your social media URLs (index.html, lines 248-253)

## Portfolio Projects

- [ ] **Replace Project Images**: Update image URLs (index.html, lines 134-206)
  - Free images: unsplash.com, pexels.com, pixabay.com
  - Or use your own project screenshots

- [ ] **Update Project Titles**: Change all project names
  - Update in HTML (lines 134-206)
  - Update in JavaScript projectDetails (script.js, lines 119-156)

- [ ] **Update Project Descriptions**: Write your own project details
  - Update in HTML (lines 134-206)
  - Update in JavaScript projectDetails (script.js, lines 119-156)

- [ ] **Verify Categories**: Ensure data-category matches your project type
  - design, development, or admin

- [ ] **Add Tools Used**: List actual tools for each project
  - Update projectDetails in script.js

- [ ] **Update Years**: Set correct completion years for projects
  - Update projectDetails in script.js

## Skills Section

- [ ] **Design Skills**: Update with your actual design tools
  - Adobe Creative Suite, Figma, Sketch, Canva, etc.
  - (index.html, lines 216-218)

- [ ] **Development Skills**: List your programming languages & frameworks
  - JavaScript, React, Python, HTML/CSS, Node.js, etc.
  - (index.html, lines 220-222)

- [ ] **Admin Skills**: List your professional capabilities
  - Project management, scheduling, CRM, communication, etc.
  - (index.html, lines 224-226)

## Visual Customization

- [ ] **Colors**: Customize primary color theme
  - Edit CSS variables in styles.css (lines 9-17)
  - Primary color: --primary-color
  - Secondary color: --secondary-color

- [ ] **Font Changes** (optional):
  - Change font-family in styles.css (line 24)
  - Google Fonts: import in styles.css

- [ ] **Company Logo** (optional):
  - Replace "Portfolio" brand text with logo image
  - Update navbar brand section (index.html, line 13)

## About Section

- [ ] **Update About Text**: Write about yourself
  - (index.html, lines 72-73)

- [ ] **Role Descriptions**: Customize the three role cards
  - (index.html, lines 75-90)

- [ ] **Role Icons** (optional):
  - Change emoji icons to match your style
  - Or replace with icon libraries (Font Awesome, etc.)

## Before Going Live

- [ ] **Test on Mobile**: View on phone/tablet
- [ ] **Test Navigation**: Click all nav links
- [ ] **Test Filters**: Verify portfolio filtering works
- [ ] **Test Form**: Submit contact form
- [ ] **Check Links**: All social/contact links work
- [ ] **Spelling Check**: Review all text for typos
- [ ] **Image Optimization**: Compress images for faster loading
- [ ] **Broken Links**: Check all external URLs

## Advanced Customization (Optional)

### To Add More Projects:
1. Copy a portfolio item block (index.html)
2. Update title, description, image, category
3. Add to projectDetails object (script.js)

### To Change Color Scheme:
Edit in styles.css (lines 9-17):
```css
--primary-color: #YourColor;
--secondary-color: #YourColor;
```

### To Add Google Analytics:
1. Create Google Analytics account
2. Get tracking ID
3. Add before closing </head> tag:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### To Enable Email Form:
Use Formspree.io or EmailJS for backend email handling (requires setup)

## File Quick Reference

| File | Purpose | Key Changes |
|------|---------|------------|
| index.html | Structure & content | Project details, skills, contact info |
| styles.css | Styling & animations | Colors, fonts, layout |
| script.js | Interactivity | Project details, form handling |
| README.md | Documentation | Reference guide |

## Testing Checklist

### Desktop
- [ ] All sections visible
- [ ] Navigation works
- [ ] Hover effects work
- [ ] Forms functional
- [ ] Smooth scrolling works

### Tablet
- [ ] Layout adjusts properly
- [ ] Navigation menu functional
- [ ] Touch interactions work
- [ ] No horizontal scrolling

### Mobile
- [ ] Hamburger menu appears
- [ ] All content visible
- [ ] Buttons clickable
- [ ] Forms accessible
- [ ] No layout issues

## Deployment Checklist

Before uploading to hosting:

- [ ] All personal info updated
- [ ] Images uploaded or linked
- [ ] Links verified
- [ ] Mobile tested
- [ ] Forms working (or hiding)
- [ ] Typos fixed
- [ ] Old placeholder text removed
- [ ] Social links added
- [ ] Analytics set up (if needed)

## Quick Links

- Unsplash Images: https://unsplash.com
- Google Fonts: https://fonts.google.com
- Color Picker: https://colorpicker.com
- Formspree: https://formspree.io
- Netlify Deploy: https://netlify.com

---

**Estimated Time to Customize**: 30-60 minutes

**Difficulty Level**: Beginner to Intermediate

Good luck with your portfolio! 🎉
