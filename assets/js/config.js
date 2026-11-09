/* =====================================================================
   R.N. WALIA, ARCHITECT & VALUER
   CENTRAL SITE CONFIGURATION
   ---------------------------------------------------------------------
   This is the ONE file to edit when business details change.

   HOW TO EDIT (no programming needed):
   • Change only the text between the quotation marks "like this".
   • Leave a value as "" (empty quotes) if it is not known yet;
     the website automatically hides anything that is empty.
   • Keep every comma and bracket exactly where it is.
   • After saving, refresh the page in your browser to see the change.

   STATUS VALUES used below:
   • "confirmed" → shown on the live website.
   • "pending"   → HIDDEN on the live website. Visible only in the local
                   development preview (open the site on your computer
                   and add ?preview to the address, e.g. index.html?preview).
   ===================================================================== */

window.SITE_CONFIG = {

  /* ------------------------------------------------------------------
     WEBSITE
     ------------------------------------------------------------------ */
  site: {
    // The public address once published, ending with a slash.
    // e.g. "https://your-username.github.io/rn-walia/" or "https://www.example.in/"
    // (Also run tools/set-site-url.mjs so the HTML meta tags use it; see README.)
    url: "https://nikeshwalia.github.io/rn-walia/",
    language: "en-IN"
  },

  /* ------------------------------------------------------------------
     NAME & DESIGNATION
     ------------------------------------------------------------------ */
  business: {
    displayName: "R.N. Walia",            // CONFIRMED (user-provided)
    designation: "Architect & Valuer",    // CONFIRMED (user-provided)
    // PENDING: "Ram Niwas Walia" appears in a public business listing.
    // Do not fill this in until the family confirms it should be used.
    fullName: "",
    summary: "Architectural and property valuation services from an office at the District Court Complex, Sector 1, Panchkula, serving Panchkula, Kalka, Moginand and surrounding areas."
  },

  /* ------------------------------------------------------------------
     OFFICE LOCATION: CONFIRMED (user-provided + public listing)
     ------------------------------------------------------------------ */
  office: {
    name: "District Court Complex, Sector 1, Panchkula",
    // Navigation landmark taken from a public listing (please re-check on site):
    landmark: "Opposite Chamber No. 6, Old Lawyers' Chambers, Court Complex",
    street: "Opposite Chamber No. 6, Old Lawyers' Chambers, District Court Complex, Sector 1",
    locality: "Panchkula",
    region: "Haryana",
    postalCode: "134108",                 // From the public listing, please confirm
    country: "IN",
    // Text used to search Google Maps for directions (no coordinates are invented):
    mapQuery: "District Court Complex, Sector 1, Panchkula, Haryana 134108"
  },

  /* ------------------------------------------------------------------
     CONTACT (leave "" until confirmed)
     Buttons for any empty value are hidden automatically.
     ------------------------------------------------------------------ */
  contact: {
    phone: "+919463391402",          // International format, digits only, e.g. "+919876543210"
    phoneDisplay: "+91 94633 91402",   // How it should look on screen, e.g. "+91 98765 43210"
    whatsapp: "919463391402",       // Digits with country code, no "+" or spaces, e.g. "919876543210"
    email: "rwalia616@gmail.com"           // e.g. "office@example.com"
  },

  /* ------------------------------------------------------------------
     OFFICE HOURS. Leave [] to hide hours entirely.
     Example: [ { days: "Monday to Saturday", time: "10 am to 5 pm" } ]
     ------------------------------------------------------------------ */
  hours: [ { days: "", time: "10 am to 5 pm" } ],   // Confirmed. Add the working days if wanted, e.g. days: "Monday to Saturday"

  /* ------------------------------------------------------------------
     SERVICE AREA
     ------------------------------------------------------------------ */
  serviceArea: {
    summary: "Panchkula, Kalka, Moginand and surrounding areas",
    areas: [
      { name: "Panchkula", note: "Office location", status: "confirmed" },
      { name: "Kalka", note: "", status: "confirmed" },
      { name: "Moginand", note: "", status: "confirmed" },
      { name: "Pinjore", note: "", status: "pending" },
      { name: "Chandigarh tricity region", note: "By arrangement", status: "pending" }
    ]
  },

  /* ------------------------------------------------------------------
     ABOUT PAGE
     ------------------------------------------------------------------ */
  about: {
    // Photographs: put the file in assets/img/ and write its path, e.g. "assets/img/portrait.jpg"
    portrait: "",
    portraitAlt: "Portrait of R.N. Walia, Architect & Valuer",
    officePhoto: "",
    officePhotoAlt: "The office of R.N. Walia at the District Court Complex, Panchkula",

    // Credentials are shown ONLY when status is "confirmed" AND a value is filled in.
    credentials: [
      { label: "Qualification", value: "", status: "pending" },
      { label: "Council of Architecture registration", value: "", status: "pending" },
      { label: "Valuer registration / empanelment", value: "", status: "pending" },
      { label: "Years in practice", value: "", status: "pending" },
      { label: "Professional memberships", value: "", status: "pending" }
    ]
  },

  /* ------------------------------------------------------------------
     CONTACT FORM DELIVERY (optional)
     GitHub Pages cannot send email by itself. Leave endpoint "" and the
     form will prepare an email / WhatsApp message / copyable summary
     instead. To have submissions delivered, create a free form at a
     service such as Formspree and paste its endpoint URL here,
     e.g. "https://formspree.io/f/abcdwxyz". See README.
     ------------------------------------------------------------------ */
  form: {
    endpoint: ""
  },

  /* ------------------------------------------------------------------
     SOCIAL / LISTING LINKS (optional). Example:
     [ { label: "Google Business Profile", url: "https://..." } ]
     ------------------------------------------------------------------ */
  social: [],

  /* ------------------------------------------------------------------
     SERVICES
     The first two follow directly from the confirmed designation
     "Architect & Valuer". Please confirm the wording.
     The others are possible services: set status to "confirmed" only
     after R.N. Walia confirms they are offered.
     ------------------------------------------------------------------ */
  services: [
    {
      id: "architectural-design",
      status: "confirmed",
      icon: "compass",
      title: "Architectural Consultation & Building Design",
      short: "Advice and design for new buildings, from a first conversation about your plot to drawings that can be developed and discussed.",
      plain: "An architect helps turn a need (a new home, a shop, an extension) into a building that works: sensible use of the plot, well-planned rooms, good light and ventilation, and drawings that builders and authorities can understand. A consultation is the starting point, where your requirement, plot and priorities are discussed before any design work begins.",
      who: [
        "Plot owners planning to build a new house",
        "Owners of shops or small commercial premises planning construction",
        "People considering a plot who want advice on what could be built",
        "Anyone who wants professional guidance before committing to construction"
      ],
      involves: [
        "An initial discussion of your requirements, plot and priorities",
        "A review of plot details and any existing drawings or documents",
        "Developing layout ideas and design options for discussion",
        "Refining the agreed design into drawings, as the scope of work requires",
        "Talking through next steps, such as approvals or engaging a builder"
      ],
      documents: [
        "Plot or site plan, with dimensions if available",
        "Any existing drawings or previously approved plans",
        "Photographs of the plot and its surroundings",
        "A list of the spaces you need: rooms, uses, parking, future plans",
        "Copies of property documents, if requested at the appropriate stage"
      ],
      questions: [
        "What is included in the scope of work, and what is not?",
        "How are fees worked out, and at what stages are they payable?",
        "Which drawings will be provided, and in what form?",
        "Who will handle building plan submissions, if they are needed?",
        "How will changes to the design be handled once work has started?"
      ],
      discovery: {
        explain: "You are planning to build, or thinking about what could be built, and would like an architect's view before decisions are made.",
        bring: ["Plot size and location", "Any existing site plan or drawings", "A rough list of what you need"],
        next: "Share a short description of your plot and requirement. The first step is usually a conversation about what you need."
      }
    },
    {
      id: "property-valuation",
      status: "confirmed",
      icon: "valuation",
      title: "Property Valuation",
      short: "A professional assessment of a property's value for a stated purpose, based on inspection, documents and relevant market information.",
      plain: "A valuation is a professional opinion of what a property is worth, as on a particular date and for a particular purpose, for example a sale, a family settlement, or a lender's requirement. It considers the property's documents, location, construction, condition and relevant market information. It is different from an asking price or an online estimate, and it cannot be given reliably without looking at the property and its papers.",
      who: [
        "Owners planning to sell, buy or transfer a property",
        "Families dividing or settling property",
        "Applicants whose bank or institution has asked for a valuation",
        "Anyone who needs an informed, documented view of a property's value"
      ],
      involves: [
        "Understanding the purpose of the valuation and who will rely on it",
        "Reviewing the property documents you provide",
        "Inspecting the property and noting its construction, condition and surroundings",
        "Considering relevant market information",
        "Preparing the valuation in the form the purpose requires"
      ],
      documents: [
        "Ownership or title documents, such as a sale deed or allotment letter",
        "Approved building plan, if the property is built",
        "The property's location and directions for the inspection",
        "Any format or requirement specified by the bank or institution",
        "Recent property tax or utility records, if relevant"
      ],
      questions: [
        "What is the purpose of the valuation, and who will rely on it?",
        "Does the bank or institution require a valuer from its own panel?",
        "When can the inspection take place, and who will provide access?",
        "What will the valuation report contain?",
        "How are fees decided?"
      ],
      note: "Banks and other institutions set their own requirements, and some accept valuations only from valuers on their own panel. Please check with them before commissioning a valuation for their use.",
      discovery: {
        explain: "You need to understand what a property is worth for a specific purpose, such as a sale, a settlement or a lender's requirement.",
        bring: ["The purpose of the valuation", "Property location and type", "Ownership documents and approved plan, if available"],
        next: "Describe the property and why the valuation is needed. The office can then explain what an assessment would involve."
      }
    },
    {
      id: "planning",
      status: "pending",
      icon: "plan",
      title: "Residential & Commercial Planning",
      short: "Layout and space planning for homes and commercial premises, so that every square foot is used well.",
      plain: "Planning is about arranging spaces so they suit the way a building will actually be used: how rooms connect, where light comes from, how people move through a home or a shop. Good planning is often the difference between a building that feels generous and one that feels awkward, even on the same plot.",
      who: [
        "Families planning a home on a plot of a known size",
        "Shop and office owners organising a commercial space",
        "Owners comparing different layout options before building"
      ],
      involves: [
        "Understanding how the space will be used, now and in future",
        "Studying the plot, orientation and any constraints",
        "Preparing layout options and discussing their trade-offs",
        "Developing the preferred layout further"
      ],
      documents: [
        "Plot dimensions or an existing site plan",
        "Any existing building drawings",
        "Your list of required spaces and priorities"
      ],
      questions: [
        "How many layout options will be prepared?",
        "Will the layout account for future expansion?",
        "What happens if the layout needs changes later?"
      ],
      discovery: {
        explain: "You want spaces in a home or commercial building arranged thoughtfully, before construction or changes begin.",
        bring: ["Plot or floor dimensions", "Existing drawings, if any", "How the space will be used"],
        next: "Tell the office about the space and how you intend to use it."
      }
    },
    {
      id: "technical-reports",
      status: "pending",
      icon: "report",
      title: "Property Technical Reports & Documentation",
      short: "Clear, professionally prepared documentation describing a property, its measurements and its particulars.",
      plain: "Some decisions and processes need a written, professional description of a property: its location, measurements, construction and other particulars. A technical report sets this out clearly. It does not replace a structural engineer's assessment where one is needed, or legal advice about ownership.",
      who: [
        "Owners asked to provide a professional description of a property",
        "People who need a property's measurements and particulars recorded",
        "Anyone who needs property information organised clearly in writing"
      ],
      involves: [
        "Understanding what the report is needed for and who will read it",
        "Reviewing documents and, where needed, visiting the property",
        "Recording measurements and particulars",
        "Preparing the report in the required form"
      ],
      documents: [
        "Property documents relevant to the report's purpose",
        "Existing drawings or plans, if available",
        "Any format specified by the person or institution requesting it"
      ],
      questions: [
        "What exactly does the report need to cover?",
        "Is a site visit required?",
        "Does the requesting institution have a required format?"
      ],
      discovery: {
        explain: "You have been asked for professional documentation about a property, or need its particulars recorded clearly.",
        bring: ["What the report is for", "Property documents", "Any required format"],
        next: "Explain who has asked for the report and what it needs to show."
      }
    },
    {
      id: "alterations",
      status: "pending",
      icon: "alteration",
      title: "Alterations, Additions & Renovation",
      short: "Professional guidance when changing, extending or renewing an existing building.",
      plain: "Changing an existing building, whether adding a floor, opening up rooms or renewing an older house, needs care. The existing structure, approved plans and practical constraints all shape what is sensible. Architectural guidance helps you understand the options before work begins.",
      who: [
        "Homeowners planning an extra floor or rooms",
        "Owners renewing an older building",
        "Anyone planning significant changes to an existing layout"
      ],
      involves: [
        "Understanding what you want to change and why",
        "Reviewing the existing building and any approved plans",
        "Discussing options and their practical implications",
        "Preparing drawings for the agreed changes, as required"
      ],
      documents: [
        "Approved building plan, if available",
        "Photographs of the existing building",
        "A description of the changes you have in mind"
      ],
      questions: [
        "Will the changes need fresh approval?",
        "Is a structural engineer's input needed?",
        "How will the work be phased if the building is occupied?"
      ],
      discovery: {
        explain: "You want to change, extend or renew an existing building and would like professional guidance first.",
        bring: ["Approved plan, if available", "Photographs", "What you want to change"],
        next: "Describe the building and the changes you are considering."
      }
    }
  ],

  /* ------------------------------------------------------------------
     ENQUIRY WIZARD OPTIONS
     ------------------------------------------------------------------ */
  propertyTypes: [
    "Independent house",
    "Flat or apartment",
    "Shop, office or commercial building",
    "Plot or land",
    "Industrial or institutional building",
    "Other"
  ],

  // Purposes offered in step 4, depending on the service chosen in step 1.
  purposes: {
    "architectural-design": ["Building a new house", "A new commercial building", "Advice before buying a plot", "Other architectural requirement"],
    "property-valuation": ["Sale or purchase", "Bank or loan requirement", "Family settlement or partition", "Personal record or planning", "Other valuation requirement"],
    "planning": ["Planning a new layout", "Reorganising an existing space", "Other planning requirement"],
    "technical-reports": ["Report requested by an institution", "Recording a property's particulars", "Other documentation requirement"],
    "alterations": ["Adding a floor or rooms", "Renovating an existing building", "Changing an existing layout", "Other alteration requirement"],
    "other": ["I'm not sure yet and would like guidance", "Another building or property matter"]
  },

  timeframes: ["No fixed timeline", "Within the next month", "Fairly soon, within a week or two", "Not sure"],

  documentsAvailable: [
    "Site or plot plan",
    "Existing or approved drawings",
    "Ownership documents",
    "Photographs"
  ],

  /* ------------------------------------------------------------------
     PORTFOLIO
     Add genuine projects only. Entries with sample: true are shown
     ONLY in the local development preview, never on the live site.
     Images go in assets/img/projects/. The Portfolio menu link appears
     automatically once at least one real (non-sample) project exists.
     Never publish private client documents, addresses or signatures.
     ------------------------------------------------------------------ */
  projects: [
    {
      sample: true,
      title: "Sample entry: Two-storey residence",
      category: "Residential",
      location: "Panchkula",
      role: "Architectural design",
      status: "Example only",
      description: "Illustrative placeholder showing how a genuine project would appear. Not a project by R.N. Walia.",
      images: []   // e.g. [ { src: "assets/img/projects/house-front.jpg", alt: "Front elevation of ..." } ]
    },
    {
      sample: true,
      title: "Sample entry: Commercial frontage",
      category: "Commercial",
      location: "",
      role: "Planning",
      status: "Example only",
      description: "Illustrative placeholder. Replace with real, approved project details or delete.",
      images: []
    }
  ]
};
