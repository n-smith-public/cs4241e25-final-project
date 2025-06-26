# Magnolia

Created By: Nick
Accessable at https://magnolia.greenbueller.com

## A Brief Overview

Magnolia, as seen in A2-A4 is a full-stack task management service, capable of helping you manage your time by keeping your deadlines in mind. With your unique login, you can add as many tasks as you would like to your task list, whether it be through manually adding or by importing an .ics (iCalendar) file from your regular calendar provider. Magnolia allows for flexibility to suit any needs.

The entire branding behind this project is based around a lyric video (for a song)[https://www.youtube.com/watch?v=7cL1hNAOmQA], as well as a line from said song. When starting Project 2 I had this on in the background, and decided to utilize the colour scheme for my project. From there, it slowly evolved as I thought of more ideas to add, like adding theme customization, adding ical support, adding a contact page, etc.

## Instructions

Everything for the website should be self-explanatory, simply login or register and then access the tool.

## Technologies

Magnolia makes use of the following tools:
- Svelte
- MongoDB
- NodeJS
- ExpressJS
- Vite
- Render for Hosting
- CloudFlare for domain services and DDOS protection

As well as the following libraries:
- BodyParser
- Path
- FS
- Crypto
- NodeMailer
- Moment
- CookieParser

The program makes use of both TypeScript for the Svelte components and JavaScript.

## Challenges, Accessibility, and Contributions

### Challenges

There were quite a few challenges in this process, but I will simply talk about the ones that occurred since A4. As I mentioned before, adding the gradient theme was not possible. In the end, I ended up leaving theme customization as it was in A4 because of this, although I was considering adding the ability for the end user to have a custom theme tied to their individual account.

Another challenging aspect was trying to get the Contact form to behave properly. I originally wanted it to be accessible from all pages, but due to the way my authentication system worked, it would not allow logged in users to have their email/display name fill in properly as I intended. Thus, it is only accessible to logged in users. Another aspect was trying to meet the Svelte ARIA suggestions. These gave massive warnings across my VS Code and made it diffcult to find actual issues with my code. I believe most of the tool is accessible even if some of these still remain.

### Accessibility

Magnolia features multiple themes for different user preferences, including a bright theme with minimal colours, as well as an inverted theme. I would also add in other themes as needed if someone requested them. The website also makes liberal use of ARIA components, meaning essentially all aspects of it should be accessible to users who require usage of alternative tools for digital mobility.

As a feature of Svelte, it is also responsive, working on any size display. At some smaller resolutions, it may require scrolling left/right to view everything, but it would be otherwise infeasible to accomodate on a vertical resolution.

### Contributions

This project was made entirely by myself. I made use of a tracking "sheet" via a Discord message for what I wanted to improve on.