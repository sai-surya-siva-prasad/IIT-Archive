# PDF Papers Storage

This directory contains all the IIT JEE exam papers organized by year and subject.

## Folder Structure

```
papers/
├── 2025/
│   ├── physics/
│   │   ├── paper-1.pdf
│   │   └── paper-2.pdf
│   ├── chemistry/
│   │   ├── paper-1.pdf
│   │   └── paper-2.pdf
│   └── mathematics/
│       ├── paper-1.pdf
│       └── paper-2.pdf
├── 2024/
└── ...
```

## How to Add PDFs

1. **Navigate to the correct folder** for the year and subject
   - Example: `papers/2025/physics/`

2. **Name your PDF files** using this format:
   - `paper-1.pdf` - First paper for that subject/year
   - `paper-2.pdf` - Second paper for that subject/year
   - `paper-3.pdf` - Third paper (if applicable)

3. **File naming convention:**
   - Use lowercase letters
   - Use hyphens (`-`) instead of spaces
   - Always include the number (paper-1, paper-2, etc.)

## Example

To add the 2025 Physics Paper I:
- Path: `papers/2025/physics/paper-1.pdf`
- The app will automatically link it to "2025 Physics Paper I"

## Notes

- PDFs are served from the `public` folder, so they're accessible at `/papers/{year}/{subject}/paper-{number}.pdf`
- Make sure PDF files are optimized (not too large) for better loading performance
- The app supports viewing PDFs directly in the browser or downloading them

