/**
 * The couple's handbook for their own dashboard.
 *
 * Written for someone who has never administered anything and should not have
 * to: short sentences, one action per step, the consequence of each button
 * said out loud, and the awkward cases named rather than left to be
 * discovered at eleven at night when a guest says the link is broken.
 *
 * It is data rather than markup so the same words serve the Documentation tab
 * and the printable /guide page, and so correcting a sentence never means
 * touching a component.
 *
 * The screenshots in `public/guide/` were taken from the real dashboard with
 * invented replies and invitations — every name in them is made up, and no
 * guest's details are in the repository.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const shot = (file: string) => `${BASE}/guide/${file}`;

export type GuideStep = {
  /** The action, in the imperative. One thing only. */
  action: string;
  /** What happens, or what to watch out for. Optional. */
  detail?: string;
};

export type GuideNote = {
  tone: "tip" | "warning";
  title: string;
  body: string;
};

export type GuideImage = { src: string; alt: string; caption: string };

export type GuideSection = {
  id: string;
  title: string;
  /** One plain sentence: what this part of the dashboard is for. */
  lead: string;
  /** One picture, or a pair shown one above the other to compare two states. */
  images?: GuideImage[];
  steps?: GuideStep[];
  notes?: GuideNote[];
};

export const GUIDE_INTRO = {
  title: "How to use your dashboard",
  blurb:
    "Everything you can do is on this page, in order, with pictures. Nothing here can break the invitation — the worst that happens is you make a link you did not need, and you can delete it.",
};

export const GUIDE: GuideSection[] = [
  {
    id: "opening",
    title: "Opening the dashboard",
    lead: "The dashboard is a private page on your own wedding website. It is not linked from anywhere — the only way in is to type the address and know the passcode.",
    images: [
      {
        src: shot("01-passcode.webp"),
        alt: "The dashboard passcode screen, with one box to type into",
        caption: "This is what you see before you are let in.",
      },
    ],
    steps: [
      {
        action: "Open your web browser and go to your website address, then add /dashboard to the end.",
        detail:
          "So: denisandmiaarrforever.site/dashboard — all one word, no spaces, no capital letters.",
      },
      {
        action: "Type your passcode into the box.",
        detail: "It is the secret word you chose. If you forget it, see the last section.",
      },
      { action: "Tap VIEW REPLIES." },
      {
        action: "Add the page to your phone's home screen so you never type it again.",
        detail:
          "On iPhone: the Share button, then Add to Home Screen. On Android: the three dots, then Add to Home screen.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "It remembers you",
        body: "Once you are in, closing the tab and coming back will not ask again. Tapping LOCK at the top forgets you on purpose — use it if you hand your phone to someone.",
      },
      {
        tone: "warning",
        title: "Keep the passcode to yourselves",
        body: "Anyone with the address and the passcode can see your whole guest list. Do not put it in a group chat.",
      },
    ],
  },
  {
    id: "tabs",
    title: "The four tabs",
    lead: "Across the top there are four buttons. They just swap what you are looking at. Tapping one never changes anything.",
    steps: [
      { action: "REPLIES", detail: "Who has answered your invitation, and what they said." },
      { action: "INVITATIONS", detail: "Make a personal link for each guest, and see who has opened theirs." },
      { action: "GALLERY", detail: "Change the photos on your website." },
      {
        action: "DRESS CODE",
        detail: "Change the pictures that show guests what to wear.",
      },
      { action: "ENTOURAGE", detail: "Change the names in your wedding party." },
      { action: "DOCUMENTATION", detail: "This guide. You are reading it." },
    ],
  },
  {
    id: "replies",
    title: "Reading your replies",
    lead: "Every time a guest fills in the RSVP form on your website, they appear here. Newest first.",
    images: [
      {
        src: shot("02-replies.webp"),
        alt: "The Replies tab, showing counts and a list of guests who have answered",
        caption:
          "The names here are made up, for the picture. Yours will be your real guests.",
      },
    ],
    steps: [
      {
        action: "Look at the three boxes at the top for your running totals.",
        detail:
          "REPLIES is how many people answered. ATTENDING is how many are coming. CANNOT COME is how many said no.",
      },
      {
        action: "Type in the search box to find one person.",
        detail: "It looks at names and at the messages they wrote.",
      },
      {
        action: "Tap ALL, ATTENDING or CANNOT COME to show only that group.",
      },
      {
        action: "Tap EXPORT CSV to get a spreadsheet of what is on the screen.",
        detail:
          "It downloads a file you can open in Excel or Google Sheets. Handy for the caterer. If you filtered to ATTENDING first, only those people are in the file.",
      },
      {
        action: "Tap REFRESH to check for new replies.",
        detail: "The page does not update by itself while you are staring at it.",
      },
    ],
    notes: [
      {
        tone: "warning",
        title: "You cannot edit a reply here",
        body: "If a guest made a mistake, ask them to send the form again, or fix the row yourself in the Google Sheet. This page only reads.",
      },
    ],
  },
  {
    id: "what-guests-see",
    title: "Why each guest needs their own link",
    lead: "Your website is closed. Someone who just types the address sees a polite closed envelope — not your invitation.",
    images: [
      {
        src: shot("07-guest-no-link.webp"),
        alt: "The closed screen a visitor sees without an invitation link",
        caption: "Without a link: told the invitation is personal, and nothing else.",
      },
      {
        src: shot("08-guest-welcome.webp"),
        alt: "The invitation greeting a guest by name after opening their own link",
        caption: "With their own link: greeted by name. (This guest is made up.)",
      },
    ],
    steps: [
      {
        action: "Each guest gets their own private link from you.",
        detail: "You make it in the INVITATIONS tab. It is the next section.",
      },
      {
        action: "Their link greets them by name and fills in their RSVP for them.",
      },
      {
        action: "The first phone to open a link keeps it.",
        detail:
          "If that guest forwards it to somebody else, the other person is turned away. That is the point of it.",
      },
    ],
    notes: [
      {
        tone: "warning",
        title: "You need a link too",
        body: "You cannot see your own website without one. Make an invitation for yourselves — call it \"Denis and Mia\" — and keep that link.",
      },
    ],
  },
  {
    id: "two-versions",
    title: "The two versions of your invitation",
    lead: "There are two invitations, and you choose which one each guest gets when you make their link.",
    steps: [
      {
        action: "The short one, which most guests get.",
        detail:
          "Everything except the entourage — no list of ninongs, ninangs, bridesmaids or groomsmen.",
      },
      {
        action: "The full one, with the entourage.",
        detail:
          "The same invitation plus the wedding party, for the people who are in it.",
      },
      {
        action: "You pick with one tick box when you make the link.",
        detail:
          "It is called Include the entourage. Leave it alone for an ordinary guest; tick it for your wedding party.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "You can change your mind later",
        body: "Every invitation card has a button that says ADD ENTOURAGE or DROP ENTOURAGE. Tapping it switches that one guest to the other version. The link stays exactly the same, so there is nothing to resend — they will just see the other version next time they open it.",
      },
      {
        tone: "tip",
        title: "Links you made before this existed",
        body: "Anything you sent before now shows the entourage, the way it always did. Nothing changed under your guests. If you want one of them switched, use DROP ENTOURAGE on their card.",
      },
    ],
  },
  {
    id: "invite-make",
    title: "Making a link for one guest",
    lead: "This is the thing you will do most. It takes about five seconds per guest.",
    images: [
      {
        src: shot("04-link-made.webp"),
        alt: "A freshly made invitation link shown in a box, ready to copy",
        caption: "After CREATE LINK, the link appears and is already copied.",
      },
    ],
    steps: [
      { action: "Tap the INVITATIONS tab." },
      {
        action: "Type the guest's name in the box that says \"Their name, as it should appear\".",
        detail:
          "Write it the way you want them greeted. \"Tita Baby\" is better than \"Mrs. Ramos\" if that is what you call her.",
      },
      {
        action: "Decide about the tick box underneath: Include the entourage.",
        detail:
          "Leave it empty for an ordinary guest. Tick it for someone in your wedding party. It stays how you leave it, so you can do all the ninongs one after another without ticking it each time.",
      },
      { action: "Tap CREATE LINK." },
      {
        action: "The link appears in a box, and it is already copied for you.",
        detail: "You do not need to select it. It is on your clipboard.",
      },
      {
        action: "Open Messenger, Viber or SMS, and paste it to that guest.",
        detail: "Paste by holding your finger down in the message box and choosing Paste.",
      },
      {
        action: "If you lose it, find their card lower down and tap COPY LINK.",
        detail: "The link never changes. You can send it again as many times as you like.",
      },
    ],
    notes: [
      {
        tone: "warning",
        title: "One link per guest or household",
        body: "Do not send the same link to two different people. The second one to open it will be locked out, and you will have to reset it.",
      },
      {
        tone: "tip",
        title: "Do them in batches",
        body: "Make ten links, send ten messages, then come back. There is no need to do all of them at once.",
      },
    ],
  },
  {
    id: "invite-read",
    title: "Seeing who has opened their invitation",
    lead: "Every guest you have invited gets a card. The card tells you whether they have looked at it yet.",
    images: [
      {
        src: shot("03-invitations.webp"),
        alt: "The invitation list, showing one unopened and two opened invitations",
        caption: "Three invitations: one not opened yet, two opened.",
      },
    ],
    steps: [
      {
        action: "NOT OPENED means they have not clicked the link yet.",
        detail: "Maybe they missed your message. A gentle follow-up is fair.",
      },
      {
        action: "OPENED means they have seen it.",
        detail:
          "Underneath, it tells you what they opened it on — \"iPhone · Safari\", \"Android · Facebook app\" — and when.",
      },
      {
        action: "The first words on each card say which invitation that guest gets.",
        detail:
          "\"With entourage\" or \"No entourage\". Tap ADD ENTOURAGE or DROP ENTOURAGE on that card to swap it.",
      },
      {
        action: "The three boxes at the top count them up.",
        detail: "INVITATIONS is how many you have made. OPENED and NOT YET split them.",
      },
      {
        action: "Use the search box when the list gets long.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Opened is not the same as replied",
        body: "Someone can look at the invitation and not fill in the form. Opened lives here; their answer lives in REPLIES.",
      },
    ],
  },
  {
    id: "reset",
    title: "When a guest says their link does not work",
    lead: "This will happen, and it is almost never the guest doing anything wrong. The fix takes one tap.",
    steps: [
      {
        action: "Find that guest's card in the INVITATIONS tab.",
        detail: "Type their name in the search box.",
      },
      { action: "Tap RESET DEVICE." },
      { action: "Say yes to the question it asks." },
      {
        action: "Send them the same link again.",
        detail: "The link does not change. The next phone to open it keeps it.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Why it happens",
        body: "The invitation remembers the first phone that opened it. If your guest first tapped the link inside Messenger and then opened it again in Chrome or Safari, their phone looks like a different one. Resetting simply forgets and starts again.",
      },
      {
        tone: "tip",
        title: "It is also the fix for the wrong person",
        body: "If a link got forwarded and a stranger opened it first, RESET DEVICE takes it back. Send it to the right guest and ask them to open it straight away.",
      },
      {
        tone: "warning",
        title: "DELETE is not the same thing",
        body: "DELETE throws the invitation away for good and the link stops working forever. If you only want to let someone back in, use RESET DEVICE.",
      },
    ],
  },
  {
    id: "gallery",
    title: "Changing the photos",
    lead: "Your website comes with your photoshoot already in it. You only need this tab if you want different pictures.",
    images: [
      {
        src: shot("05-gallery-empty.webp"),
        alt: "The Gallery tab before any photos have been uploaded",
        caption:
          "Before you upload anything, your original photoshoot is what guests see.",
      },
      {
        src: shot("06-gallery-full.webp"),
        alt: "The Gallery tab with uploaded photos, each with a remove button",
        caption: "After uploading: tap the × on a photo to take it off the website.",
      },
    ],
    steps: [
      { action: "Tap the GALLERY tab." },
      {
        action: "Tap UPLOAD PHOTOS and choose pictures from your phone.",
        detail:
          "You can pick several at once. They upload one at a time and you will see each one say Sending, then Added.",
      },
      {
        action: "Wait until every photo says Added before leaving the page.",
        detail: "A big photo over mobile data can take a few seconds each.",
      },
      {
        action: "To remove one, tap the × in its corner.",
      },
      {
        action: "To go back to your original photoshoot, tap EMPTY THE GALLERY.",
        detail:
          "Nothing is lost. Your photoshoot is built into the website and comes straight back.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "The moment you upload one, your uploads take over",
        body: "The website shows either your uploads or the built-in photoshoot — never both mixed together. An empty gallery means the photoshoot.",
      },
      {
        tone: "tip",
        title: "To change the order",
        body: "Open your Google Sheet, go to the Gallery tab, and drag the rows. The order there is the order on your website.",
      },
      {
        tone: "warning",
        title: "Do not upload hundreds",
        body: "These photos come from Google Drive rather than from the website itself, so a very large gallery makes the page slow for guests. A few dozen favourites is the sweet spot.",
      },
    ],
  },
  {
    id: "dresscode",
    title: "Changing the dress code pictures",
    lead: "The pictures that show your ninongs, ninangs and entourage what to wear are yours to change. If your designer sends a new version of one, you can put it up yourself.",
    images: [
      {
        src: shot("13-dresscode.webp"),
        alt: "The Dress code tab, showing both existing pictures with a Change picture button on each",
        caption: "Both of your pictures are already here, ready to be changed.",
      },
    ],
    steps: [
      {
        action: "Tap the DRESS CODE tab.",
        detail:
          "Your two pictures are already listed, the same two your guests see.",
      },
      {
        action: "To swap one for a new version, tap CHANGE PICTURE under it.",
        detail:
          "Pick the new one from your phone. The words above it stay the same, and it stays in the same place in the list. The old picture goes to your Drive bin.",
      },
      {
        action: "To fix the words above a picture, type over them and tap outside the box.",
        detail:
          "Like changing \"For the Entourage\" to \"For our Bridesmaids & Groomsmen\".",
      },
      {
        action: "To take one off your website, tap REMOVE THIS PICTURE on it.",
      },
      {
        action: "To add a third, write who it is for in ADD ANOTHER ONE, then tap CHOOSE A PICTURE.",
        detail:
          "The button stays grey until you have written who it is for — that is on purpose, so no picture goes up without a label.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Send a big, clear picture",
        body: "Guests tap these to see them full screen and read the small print. A picture straight from your designer is ideal — a photo of a printed one, or a screenshot, will look blurry when enlarged.",
      },
      {
        tone: "tip",
        title: "Changing one does not touch the other",
        body: "Each picture is its own. Changing, renaming or removing one leaves the rest exactly as they were.",
      },
      {
        tone: "tip",
        title: "Starting over",
        body: "BACK TO THE ORIGINAL BOARDS puts back the two pictures your website was built with and throws away your changes here. Anything you uploaded goes to your Drive bin, where Google keeps it for 30 days.",
      },
    ],
  },
  {
    id: "entourage",
    title: "Changing the entourage",
    lead: "The list of names — ninongs, ninangs, bridesmaids, groomsmen, bearers — is yours to edit here. You do not need anyone's help to fix a spelling or add a sponsor.",
    images: [
      {
        src: shot("11-entourage.webp"),
        alt: "The Entourage tab, with each part of the wedding party as a closed row",
        caption: "Each part of the wedding party, with how many names it holds.",
      },
      {
        src: shot("12-entourage-open.webp"),
        alt: "The principal sponsors opened, showing the ninongs and ninangs as editable lists",
        caption: "Opened up: a heading, and the names one on each line.",
      },
    ],
    steps: [
      { action: "Tap the ENTOURAGE tab." },
      {
        action: "Tap the part you want to change, like Principal sponsors.",
        detail: "It opens up. Tapping it again closes it.",
      },
      {
        action: "Type in the box of names. One name on each line.",
        detail:
          "To add somebody, go to the end and press Enter for a new line. To remove somebody, delete their line. To fix a spelling, just type over it.",
      },
      {
        action: "Tap SAVE CHANGES at the top.",
        detail:
          "Until you do, nothing on your website has changed. The button tells you when there is something waiting to be saved.",
      },
      {
        action: "If you make a mess, tap UNDO MY CHANGES.",
        detail: "That throws away everything you have typed since the last save.",
      },
    ],
    notes: [
      {
        tone: "tip",
        title: "Adding a whole new group",
        body: "ADD ANOTHER BLOCK HERE makes an empty one — give it a heading, like \"Junior Bridesmaids\", and type the names underneath. MOVE UP and MOVE DOWN set the order they appear in.",
      },
      {
        tone: "tip",
        title: "The secondary sponsors and bearers are different",
        body: "Those have a line of words instead of a heading — \"To tie our hearts as one\" — and a box for what they carry, like \"Ring\". Everything else works the same.",
      },
      {
        tone: "warning",
        title: "Nothing is saved until you tap Save",
        body: "If you close the page with changes still showing, they are gone. The page tells you plainly when you have unsaved changes.",
      },
      {
        tone: "tip",
        title: "Going back to the original",
        body: "BACK TO THE ORIGINAL LIST returns the entourage to the one your website was built with. Your edits are removed, but nothing else about the website changes.",
      },
      {
        tone: "tip",
        title: "Only some guests see this",
        body: "Remember the two versions — a guest whose link was made without the entourage will not see any of these names, however you edit them.",
      },
    ],
  },
  {
    id: "problems",
    title: "If something looks wrong",
    lead: "The short list of things that actually go wrong, and what to do about each.",
    steps: [
      {
        action: "\"A guest says the link does not work.\"",
        detail: "INVITATIONS tab, find their name, RESET DEVICE, send the link again.",
      },
      {
        action: "\"I ticked the wrong thing about the entourage.\"",
        detail:
          "INVITATIONS tab, find their card, tap ADD ENTOURAGE or DROP ENTOURAGE. The link does not change and there is nothing to resend.",
      },
      {
        action: "\"I cannot open my own website.\"",
        detail:
          "You need your own invitation link, like any guest. Make one for yourselves and keep it.",
      },
      {
        action: "\"The dashboard says my passcode was not accepted.\"",
        detail:
          "Check for a capital letter or a space. If it is truly lost, the passcode lives inside the Google Apps Script — whoever set up your sheet can change it.",
      },
      {
        action: "\"It says it cannot reach the guest list.\"",
        detail:
          "Usually your internet. Tap REFRESH. If it keeps happening, tell whoever built the site.",
      },
      {
        action: "\"A reply is wrong.\"",
        detail: "Fix the row in the Google Sheet, then tap REFRESH here.",
      },
      {
        action: "\"I changed the entourage but my website still shows the old names.\"",
        detail:
          "Check that you tapped SAVE CHANGES. If you did, close the invitation and open it again — it keeps a copy of the last list it saw, and a fresh open picks up the new one.",
      },
      {
        action: "\"I changed a dress code picture but my website shows the old one.\"",
        detail:
          "Close the invitation and open it again. It keeps a copy of the last pictures it saw, and a fresh open picks up the new one.",
      },
      {
        action: "\"A photo will not upload.\"",
        detail:
          "Try one photo on its own, on wifi. If it still fails, it may be an unusual file type — screenshot it and upload the screenshot.",
      },
    ],
    notes: [
      {
        tone: "warning",
        title: "Nothing here deletes your wedding website",
        body: "The worst you can do from this page is delete an invitation or a photo. The invitation itself, the words, the design and your photoshoot are all safe.",
      },
    ],
  },
];
