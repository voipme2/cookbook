import { useState } from "react";
import { FileDown } from "lucide-react";
import type { Recipe } from "~/types";

interface ExportPdfButtonProps {
  recipe: Recipe;
}

export function ExportPdfButton({ recipe }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Dynamically import to avoid SSR issues
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // Create a hidden container with the recipe content
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.backgroundColor = "white";
      container.style.padding = "40px";
      container.style.fontFamily = "system-ui, -apple-system, sans-serif";

      // Build the HTML content
      container.innerHTML = generateRecipeHtml(recipe);
      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Remove the container
      document.body.removeChild(container);

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${recipe.id}-${recipe.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      title="Export as PDF"
      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
      ) : (
        <FileDown size={20} />
      )}
    </button>
  );
}

function generateRecipeHtml(recipe: Recipe): string {
  const sections: string[] = [];

  // Header
  sections.push(`
    <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; color: #111827;">${escapeHtml(recipe.name)}</h1>
      ${recipe.description ? `<p style="color: #6b7280; font-style: italic; margin: 0;">${escapeHtml(recipe.description)}</p>` : ""}
    </div>
  `);

  // Cooking Info
  const infoItems: string[] = [];
  if (recipe.servings)
    infoItems.push(
      `<span><strong>Servings:</strong> ${escapeHtml(recipe.servings)}</span>`
    );
  if (recipe.prepTime)
    infoItems.push(
      `<span><strong>Prep Time:</strong> ${escapeHtml(recipe.prepTime)}</span>`
    );
  if (recipe.cookTime)
    infoItems.push(
      `<span><strong>Cook Time:</strong> ${escapeHtml(recipe.cookTime)}</span>`
    );
  if (recipe.inactiveTime)
    infoItems.push(
      `<span><strong>Inactive Time:</strong> ${escapeHtml(recipe.inactiveTime)}</span>`
    );
  if (recipe.difficulty)
    infoItems.push(
      `<span><strong>Difficulty:</strong> ${escapeHtml(recipe.difficulty)}</span>`
    );
  if (recipe.author)
    infoItems.push(
      `<span><strong>Author:</strong> ${escapeHtml(recipe.author)}</span>`
    );

  if (infoItems.length > 0) {
    sections.push(`
      <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 14px;">
        ${infoItems.join("")}
      </div>
    `);
  }

  // Dietary Options
  const options: string[] = [];
  if (recipe.options?.isVegetarian) options.push("Vegetarian");
  if (recipe.options?.isVegan) options.push("Vegan");
  if (recipe.options?.isDairyFree) options.push("Dairy Free");
  if (recipe.options?.isGlutenFree) options.push("Gluten Free");
  if (recipe.options?.isCrockPot) options.push("Crock Pot");

  if (options.length > 0) {
    sections.push(`
      <div style="margin-bottom: 24px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${options.map((opt) => `<span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 12px; font-weight: 500;">${opt}</span>`).join("")}
      </div>
    `);
  }

  // Ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    sections.push(`
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; color: #111827;">Ingredients</h2>
        <ul style="margin: 0; padding: 0; list-style: none;">
          ${recipe.ingredients
            .map(
              (ing) => `
            <li style="padding: 6px 0; display: flex; align-items: flex-start;">
              <span style="color: #9ca3af; margin-right: 12px;">•</span>
              <span>${escapeHtml(ing)}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `);
  }

  // Instructions
  sections.push(`
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; color: #111827;">Instructions</h2>
      ${
        recipe.steps && recipe.steps.length > 0
          ? `<ol style="margin: 0; padding: 0; list-style: none;">
          ${recipe.steps
            .map(
              (step, idx) => `
            <li style="padding: 8px 0; display: flex; gap: 12px;">
              <span style="font-weight: bold; color: #6b7280; flex-shrink: 0; min-width: 24px;">${idx + 1}.</span>
              <span>${escapeHtml(step)}</span>
            </li>
          `
            )
            .join("")}
        </ol>`
          : `<p style="color: #6b7280; font-style: italic;">No instructions provided.</p>`
      }
    </div>
  `);

  // Notes
  if (recipe.notes) {
    sections.push(`
      <div style="margin-bottom: 24px; padding: 16px; background-color: #fefce8; border: 1px solid #fde047; border-radius: 8px;">
        <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 14px; color: #111827;">Notes</h3>
        <p style="margin: 0; font-size: 14px; white-space: pre-wrap; color: #374151;">${escapeHtml(recipe.notes)}</p>
      </div>
    `);
  }

  // Source
  if (recipe.source) {
    sections.push(`
      <div style="padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <strong>Source:</strong> ${escapeHtml(recipe.source)}
      </div>
    `);
  }

  // Footer
  sections.push(`
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center;">
      Exported from The Trusted Palate
    </div>
  `);

  return sections.join("");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
