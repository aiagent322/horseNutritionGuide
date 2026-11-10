HorseNutritionGuide.com — Prototype README
==========================================
Version: 1.2 — Claude vision OCR via Cloudflare Worker


WHAT THIS PROJECT IS
---------------------
HorseNutritionGuide.com is a free educational website for horse owners. The core
product is the Horse Feed Label Decoder: a tool that lets a horse owner provide
text from a commercial horse feed label — by pasting it or photographing it —
and receive a plain-English breakdown of:

  - What type of feed it appears to be
  - What the ingredients do and what categories they fall into
  - Guaranteed analysis values (protein, fat, fiber, NSC, sugar, starch, etc.)
  - Sugar/starch cautions relevant to metabolic horses
  - Vitamin, mineral, digestive support, and hoof/coat notes
  - Questions the owner should ask their vet or feed rep
  - A plain-English summary of the label
  - When to consult a veterinarian or equine nutritionist

This tool does NOT diagnose disease, prescribe feed, endorse brands, or make
medical claims. It is educational label interpretation only.


HOW TO OPEN LOCALLY
--------------------
1. Serve the folder with any static server (e.g. python3 -m http.server).
2. Paste-label decoding, saved labels and the glossary work offline.
3. Photo scanning needs internet: it posts to the OCR worker
   (repo aiagent322/horse-nutrition-ocr, horse-nutrition-ocr.bridleandbit.workers.dev),
   which only accepts requests from the production origins.


FILES INCLUDED
--------------
  index.html   — Complete website structure and layout
  styles.css   — All styling (responsive, mobile-first)
  script.js    — Decoder logic + OCR integration
  README.txt   — This file


INPUT METHODS
-------------
The decoder now supports two ways to get feed label text into the tool:

  METHOD 1 — PASTE LABEL TEXT
  The original method. Copy the ingredient list, guaranteed analysis, and
  feeding directions from the bag and paste into the textarea. Works offline.

  METHOD 2 — SCAN FEED LABEL (PHOTO)
  Upload or take a photo of the label. The browser downscales it to 1568px,
  sends it to the OCR worker, which asks Claude (vision) to transcribe the label.
  The extracted text is placed into the textarea for review before decoding.
  Saved-label and paste paths run entirely client-side and cost nothing.

  OCR ACCURACY NOTE: Transcription can misread small print or compressed
  type. Always review extracted text before clicking Decode Label.

  TIPS for best results:
    - Clear, well-lit photo with no shadows across the label
    - Keep the label flat and the camera parallel to the text
    - Fill the frame with the ingredient list and guaranteed analysis panel
    - Avoid motion blur


OCR TECHNICAL DETAILS
---------------------
  Engine:       Claude (claude-sonnet-4-6) via Cloudflare Worker, POST /ocr
  Accepted:     image/jpeg, image/png, image/webp (type checked against file bytes)
  Client:       downscale to 1568px long edge, EXIF rotation applied, JPEG upload
  Worker limit: 5.5M base64 characters
  Error handling: no image, non-image file, unsupported type, too large,
                  rate limited, unreadable image, network failure


WHAT THE DECODER LOGIC DOES
-----------------------------
Rule-based JavaScript pattern matching (unchanged from v1.0):

  1. FEED TYPE CLASSIFICATION
     Detects keywords: "senior," "ration balancer," "complete feed,"
     "low starch," "performance," and ingredient patterns.

  2. INGREDIENT SIGNAL DETECTION
     Categorizes detected ingredients into:
       - Fiber energy sources
       - Grain/starch energy sources
       - Fat energy sources
       - Protein sources
       - Sugar/palatability ingredients
       - Minerals (macro and trace)
       - Vitamins
       - Digestive support ingredients
       - Hoof/skin/coat support ingredients

  3. GUARANTEED ANALYSIS EXTRACTION
     Regex patterns detect numeric values near: crude protein, crude fat,
     crude fiber, NSC, sugar, starch, calcium, phosphorus, selenium, vitamin E.

  4. OUTPUT GENERATION
     11 labeled output sections + plain-English summary + vet section.

  5. INGREDIENT LIBRARY — 21 ingredient cards
  6. GUARANTEED ANALYSIS GUIDE — 13 analysis terms explained
  7. EXAMPLE LABEL — pre-loaded for testing


WHAT SHOULD BE BUILT NEXT
--------------------------
  1. LARGER INGREDIENT DATABASE
     The current signal detection covers ~60 ingredients. A full commercial
     feed label database would include 200+ ingredients with category, notes,
     and research citations. Consider a JSON ingredient database.

  2. FEED COMPARISON TOOL
     Allow users to paste and compare two feed labels side by side.

  3. SAVED REPORTS
     Allow users to save decoded reports as PDF or printable pages.
     Client-side via browser print CSS or jsPDF.

  4. HORSE GENIUS INTEGRATION
     Long-term: connect to TheHorseGenius.com voice AI device
     (NVIDIA Jetson + RAG) so owners can photograph a label and receive a
     voice-narrated breakdown. The structured ingredient database built here
     becomes the knowledge corpus for the RAG pipeline.

  5. VETERINARIAN / NUTRITIONIST REFERRAL DIRECTORY
     A searchable directory of equine nutritionists by region.

  6. HAY ANALYSIS INTEGRATION
     Accept hay analysis results (Equi-Analytical or similar labs) and
     combine with the feed label to evaluate total diet.


DISCLAIMER REMINDER
--------------------
This tool is for educational label interpretation only. It does not diagnose,
treat, or prescribe. No veterinary or nutritional advice is implied. All
assessments are based solely on label text provided by the user.

For horses with laminitis, insulin resistance, PPID/Cushing's, colic history,
PSSM/EPSM, or any medical condition — consult a licensed veterinarian or
qualified equine nutritionist before changing feed.


BUILD INFO
----------
  Version:      1.2 — Claude vision OCR
  Stack:        HTML5, CSS3, Vanilla JavaScript (ES6+)
  Dependencies: none client-side; OCR worker (horse-nutrition-ocr)
  Responsive:   Yes — mobile-first, tested to 320px
  License:      Proprietary — HorseNutritionGuide.com / Western Media Group
