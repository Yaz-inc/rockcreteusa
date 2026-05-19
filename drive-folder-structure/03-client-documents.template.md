# 03 - Client Documents

Reference material the client provided. Rockcrete USA's own institutional content.

## Important rule: do not rename anything here

These files are the client's own documents. They may have been distributed externally, referenced by URL elsewhere, or cited in client systems. Renaming breaks audit trails and confuses the client when they look at their own folder.

Accept whatever naming the client uses, even if it's inconsistent with our conventions. If a typo is glaring, surface it verbally, do not fix the file.

## What goes here

- Policy and procedure manuals.
- Process maps and operational documentation.
- Existing system documentation.
- Reports, studies, executive summaries.
- Forms and templates the client uses today.
- Organizational charts.
- Strategic plans.
- Existing brand guidelines (if relevant for branding/website projects).

## What does NOT go here

- Anything we generated → it goes in the Git repo or in `04 - Ideation/`.
- Contracts the client and team signed → `01 - Procurement and Contracts/`.
- Working drafts that mix client and team content → keep them in the Git repo.

## Suggested subfolders

Mirror whatever organizational structure the client uses. Common shapes:

```
03 - Client Documents/
├── Policy Manuals/
├── Operational Documentation/
├── Reports/
├── Forms and Templates/
├── Organizational Charts/
└── Existing Systems/
```

If the client has named subdomains (departments, divisions, programs), it can be cleaner to mirror their structure:

```
03 - Client Documents/
├── Department A/
├── Department B/
├── Program X/
└── Program Y/
```

## Large binaries

This folder typically holds the largest files in the engagement (hundreds of MB of PDFs, ZIPs of historical artifacts, large datasets). Keep them here, not in Git. The `99 - Archive/` folder is for backups of these once they are superseded.

If you create a derived artifact (an extracted spreadsheet, a summarized PDF, a transcribed transcript), put the derived artifact in the Git repo's `research/` tree, not back into this folder.

## Working language

Files here will mostly be in en. That's fine. If the team needs an English (or other) translation, generate it as a derived artifact in the Git repo's `research/` tree, do not modify the original.
