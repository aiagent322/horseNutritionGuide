HorseNutritionGuide.com — Prototype README
==========================================
Version: 1.1 — OCR Upgrade


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
1. Unzip the project folder.
2. Open index.html in any modern web browser (Chrome, Firefox, Safari, Edge).
3. No server required.
4. INTERNET ACCESS IS REQUIRED for the OCR feature (Tesseract.js is loaded from
   CDN: https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js).
   The paste-label decoder works fully offline without internet.


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

  METHOD 2 — SCAN FEED LABEL (OCR)
  New in v1.1. Upload a photo of your feed label. The site uses Tesseract.js
  to run optical character recognition (OCR) directly in the browser. The
  extracted text is placed into the textarea for review before decoding.

  OCR ACCURACY NOTE: OCR can misread small print, ligatures, or compressed
  type. Always review extracted text before clicking Decode Label.

  OCR TIPS for best results:
    - Use a clear, well-lit photo with no shadows across the label
    - Keep the label flat and the camera parallel to the text
    - Crop close to the ingredient list and guaranteed analysis panel
    - Avoid motion blur — hold the camera steady or use a document stand


OCR TECHNICAL DETAILS
---------------------
  Library:      Tesseract.js v5
  CDN source:   https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
  Language:     English (eng)
  Execution:    100% client-side — runs entirely in the user's browser
  Internet req: Yes (to load the CDN library and English traineddata on first use)
  Offline use:  Download tesseract.min.js locally and update the script src path
  Error handling:
    - No image selected
    - File too large (>30 MB)
    - Non-image file type
    - Tesseract CDN load failure (network error)
    - Unreadable image (text too small, blurry, or dark)
    - Unknown OCR engine error


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
  1. IMPROVED OCR PIPELINE
     Current Tesseract.js client-side OCR is a prototype. Upgrade options:
       a. Google Cloud Vision API — significantly higher accuracy for dense
          small print on feed labels
       b. Apple Live Text workflow — integrate on iOS for near-perfect accuracy
          using Apple's native OCR layer
       c. Server-side pipeline — upload image to a Node.js or Python endpoint,
          run OCR server-side, return clean text (removes CDN dependency)
       d. Claude API multimodal — send the image to Claude claude-sonnet-4-6 with
          a structured extraction prompt; Claude can identify and transcribe
          ingredient lists and guaranteed analysis panels with high accuracy
          even from imperfect photos

  2. LARGER INGREDIENT DATABASE
     The current signal detection covers ~60 ingredients. A full commercial
     feed label database would include 200+ ingredients with category, notes,
     and research citations. Consider a JSON ingredient database.

  3. FEED COMPARISON TOOL
     Allow users to paste and compare two feed labels side by side.

  4. SAVED REPORTS
     Allow users to save decoded reports as PDF or printable pages.
     Client-side via browser print CSS or jsPDF.

  5. HORSE GENIUS INTEGRATION
     Long-term: connect to TheHorseGenius.com voice AI device
     (NVIDIA Jetson + RAG) so owners can photograph a label and receive a
     voice-narrated breakdown. The structured ingredient database built here
     becomes the knowledge corpus for the RAG pipeline.

  6. VETERINARIAN / NUTRITIONIST REFERRAL DIRECTORY
     A searchable directory of equine nutritionists by region.

  7. HAY ANALYSIS INTEGRATION
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
  Version:      1.1 — OCR Upgrade
  Stack:        HTML5, CSS3, Vanilla JavaScript (ES6+)
  Dependencies: Tesseract.js v5 (CDN, OCR feature only)
  Responsive:   Yes — mobile-first, tested to 320px
  License:      Proprietary — HorseNutritionGuide.com / Western Media Group
