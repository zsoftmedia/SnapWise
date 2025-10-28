import React, { useRef, useState } from "react";
import {
  SlAvatar,
  SlButton,
  SlCard,
  SlDivider,
  SlDropdown,
  SlIcon,
  SlMenu,
  SlMenuItem,
  SlSpinner
} from "@shoelace-style/shoelace/dist/react";
import ProjectDrawer from "../../projectDrawer/projectDrawer";
import { useGetProjectsQuery } from "../../../api/project/projectsApi";

/* ===== Types ===== */
type TaskPhotoRow = {
  id: string;
  storage_url: string | null;
  url: string | null;
  file_name: string;
  pair_id: string | null;
  phase: "before" | "after" | string;
  captured_at: string;
  description: string | null;
  status: string | null;
};

type Pair = {
  pairId: string;
  before?: TaskPhotoRow;
  after?: TaskPhotoRow;
};

type TaskDetailProps = {
  taskData: any;
  photoPairs: Pair[];
  loading: boolean;
  onBack: () => void;
  projectId?: string | null;
};

/* ===== Lazy import for html2pdf ===== */
async function loadHtml2Pdf() {
  const mod = (await import("html2pdf.js")) as any;
  return mod.default || mod;
}

/* ===== Component ===== */
export default function TaskDetail({
  taskData,
  photoPairs,
  loading,
  onBack,
  projectId
}: TaskDetailProps) {
  const [downloading, setDownloading] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  const { data: projects } = useGetProjectsQuery();
  const project = projects?.find((p) => p.id === projectId);

  function imgSrc(p: TaskPhotoRow) {
    return p.storage_url || p.url || "";
  }

  /* ========== BUILD PRINTABLE PDF NODE (HTML content to be rendered) ========== */
  function buildPrintableNode(): HTMLElement {
    const wrapper = document.createElement("div");
    const style = document.createElement("style");

    // CSS for PDF-friendly styling (+ page-break helper)
    style.textContent = `
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      html, body { margin:0; padding:0; } 
      .pdf-wrap { background:#fff; color:#0f172a; font-family:'Arial','Segoe UI',sans-serif; }
      
      .pdf-container { 
        max-width:820px; 
        margin:0 auto; 
        padding: 0 40px; 
        position:relative; 
        font-size:13px; 
        line-height:1.5; 
      }

      /* Page break helper: force a new page */
      .pdf-page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
      }

      /* Cover page */
      .pdf-cover-content {
        text-align:center;
        padding-bottom:20px;
        border-bottom:2px solid #e2e8f0;
        page-break-after: always; /* Cover page ends here */
        padding-top: 0; 
      }
      .pdf-title {
        font-size:28px;
        font-weight:800;
        color:#2563eb;
        margin:0 0 6px;
      }
      .pdf-subtitle {
        font-size:16px;
        color:#475569;
        margin-bottom:10px;
      }
      .pdf-company {
        font-size:14px;
        color:#475569;
        margin-top:8px;
        font-weight:600;
      }

      /* Sections */
      .pdf-section { margin-top:24px; }
      .pdf-section h2 {
        font-size:18px;
        font-weight:700;
        color:#0f172a;
        margin-bottom:10px;
        border-bottom:2px solid #e5e7eb;
        padding-bottom:4px;
      }

      /* Info Grid */
      .pdf-info-grid {
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px 32px;
        font-size:13px;
        color:#475569;
        margin-bottom:12px;
      }
      .pdf-info-grid div strong {
        color:#0f172a;
        display:inline-block;
        min-width:100px;
      }

      /* Photos Section */
      .pdf-photo-section { 
        margin-top: 20px; 
      }
      .pdf-photo-section h2 {
        font-size:18px;
        font-weight:700;
        color:#2563eb;
        margin:10px 0 14px;
        border-bottom:2px solid #e2e8f0;
        padding-bottom:4px;
      }

      /* Photo Pairs */
      .pdf-pair-title {
        font-size:14px;
        font-weight:700;
        margin:14px 0 8px;
        color:#0f172a;
      }
      .pdf-photo-row {
        display:flex;
        justify-content:space-between;
        gap:16px;
        margin-bottom:26px;
        page-break-inside:avoid; /* keep pair together */
      }
      .pdf-photo-col {
        position:relative;
        width:49%;
        border:1px solid #e5e7eb;
        border-radius:8px;
        background:#f9fafb;
        overflow:hidden;
        box-shadow:0 0 4px rgba(0,0,0,0.05);
      }
      .pdf-photo-col img {
        width:100%;
        height:auto;
        max-height:330px;
        object-fit:contain;
        background:#fff;
        display:block;
      }

      .pdf-status-tab {
        position:absolute;
        top:0;
        left:0;
        padding:5px 12px;
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
        color:#fff;
        border-bottom-right-radius:8px;
      }
      .status-before { background:#2563eb; }
      .status-after { background:#16a34a; }
      .status-in_progress { background:#f97316; }
      .status-blocked { background:#dc2626; }
      .status-finished { background:#0d9488; }

      .pdf-desc {
        font-size:12px;
        color:#475569;
        padding:8px 10px;
        background:#f8fafc;
        border-top:1px solid #e5e7eb;
        min-height:40px;
      }
    `;
    wrapper.appendChild(style);

    const root = document.createElement("div");
    root.className = "pdf-wrap";
    
    const container = document.createElement("div");
    container.className = "pdf-container";

    /* ===== Page 1: Cover/Details ===== */
    const coverContent = document.createElement("div");
    coverContent.className = "pdf-cover-content";

    const title = document.createElement("h1");
    title.className = "pdf-title";
    title.textContent = project?.name || "Project Report";
    coverContent.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.className = "pdf-subtitle";
    subtitle.textContent = project?.location || "—";
    coverContent.appendChild(subtitle);

    const company = document.createElement("div");
    company.className = "pdf-company";
    company.textContent = project?.client_name
      ? `Created by ${project.client_name}`
      : "Created by SnapWise";
    coverContent.appendChild(company);

    const projSection = document.createElement("div");
    projSection.className = "pdf-section";
    const projTitle = document.createElement("h2");
    projTitle.textContent = "Project Details";
    projSection.appendChild(projTitle);
    const projGrid = document.createElement("div");
    projGrid.className = "pdf-info-grid";
    projGrid.innerHTML = `
      <div><strong>Project ID:</strong> ${project?.project_id || "—"}</div>
      <div><strong>Location:</strong> ${project?.location || "—"}</div>
      <div><strong>Work Type:</strong> ${project?.work_type || "—"}</div>
      <div><strong>Budget:</strong> €${project?.budget_eur?.toLocaleString("de-DE") || "—"}</div>
      <div><strong>Start Date:</strong> ${project?.start_date || "—"}</div>
      <div><strong>End Date:</strong> ${project?.end_date || "—"}</div>
    `;
    projSection.appendChild(projGrid);
    coverContent.appendChild(projSection);

    const compSection = document.createElement("div");
    compSection.className = "pdf-section";
    const compTitle = document.createElement("h2");
    compTitle.textContent = "Supervisor & Company Info";
    compSection.appendChild(compTitle);
    const compGrid = document.createElement("div");
    compGrid.className = "pdf-info-grid";
    compGrid.innerHTML = `
      <div><strong>Supervisor:</strong> ${project?.supervisor || "—"}</div>
      <div><strong>Email:</strong> ${"—"}</div>
      <div><strong>Contact:</strong> ${"—"}</div>
      <div><strong>Company:</strong> ${project?.client_name || "—"}</div>
    `;
    compSection.appendChild(compGrid);
    coverContent.appendChild(compSection);

    container.appendChild(coverContent);

    /* ===== Photos Section (2 pairs per page = 4 images per page) ===== */
    const photosSection = document.createElement("div");
    photosSection.className = "pdf-photo-section";
    const h2 = document.createElement("h2");
    h2.textContent = "Before / After Overview";
    photosSection.appendChild(h2);

    photoPairs.forEach((pair, i) => {
      const label = document.createElement("div");
      label.className = "pdf-pair-title";
      label.textContent = `Pair ${i + 1}`;
      photosSection.appendChild(label);

      const row = document.createElement("div");
      row.className = "pdf-photo-row";

      const before = document.createElement("div");
      before.className = "pdf-photo-col";
      if (pair.before) {
        const tab = document.createElement("div");
        tab.className = `pdf-status-tab status-${pair.before.status || "before"}`;
        tab.textContent = pair.before.status || "Before";
        before.appendChild(tab);

        const img = document.createElement("img");
        img.onerror = () => {
          img.src = `https://placehold.co/600x400/cccccc/333333?text=Image+Unavailable`;
        };
        img.src = pair.before.storage_url || pair.before.url || "";
        before.appendChild(img);

        const desc = document.createElement("div");
        desc.className = "pdf-desc";
        desc.textContent = pair.before.description || "";
        before.appendChild(desc);
      } else {
        const desc = document.createElement("div");
        desc.className = "pdf-desc";
        desc.textContent = "No Before";
        before.appendChild(desc);
      }

      const after = document.createElement("div");
      after.className = "pdf-photo-col";
      if (pair.after) {
        const tab = document.createElement("div");
        tab.className = `pdf-status-tab status-${pair.after.status || "after"}`;
        tab.textContent = pair.after.status || "After";
        after.appendChild(tab);

        const img = document.createElement("img");
        img.onerror = () => {
          img.src = `https://placehold.co/600x400/cccccc/333333?text=Image+Unavailable`;
        };
        img.src = pair.after.storage_url || pair.after.url || "";
        after.appendChild(img);

        const desc = document.createElement("div");
        desc.className = "pdf-desc";
        desc.textContent = pair.after.description || "";
        after.appendChild(desc);
      } else {
        const desc = document.createElement("div");
        desc.className = "pdf-desc";
        desc.textContent = "No After";
        after.appendChild(desc);
      }

      row.appendChild(before);
      row.appendChild(after);
      photosSection.appendChild(row);

      // 🔹 Force a new page after every 2 pairs, except after the last pair
      const isEndOfPage = (i + 1) % 2 === 0;
      const isNotLastPair = i < photoPairs.length - 1;
      if (isEndOfPage && isNotLastPair) {
        const brk = document.createElement("div");
        brk.className = "pdf-page-break";
        photosSection.appendChild(brk);
      }
    });

    container.appendChild(photosSection);
    root.appendChild(container);
    wrapper.appendChild(root);
    return wrapper;
  }

  /* ===== Build & Download PDF (fixed chaining + page header numbers) ===== */
  async function buildPdfBlob(filename = "Project_Report.pdf"): Promise<Blob> {
    const html2pdf = await loadHtml2Pdf();
    const node = buildPrintableNode();

    const projectInfo = {
      name: project?.name || "Project",
      location: project?.location || ""
    };

    const h2p = (html2pdf as any)()
      .set({
        margin: [20, 10, 20, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          info: {
            title: projectInfo.name + " Report",
            subject: projectInfo.location,
            author: project?.supervisor || "SnapWise"
          }
        },
        pagebreak: { mode: "css" }
      })
      .from(node)
      .toPdf();

    // ✅ Correctly get jsPDF instance
    const pdf: any = await h2p.get("pdf");

    // Draw header+footer on every page
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Header
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);
      const headerText = `${projectInfo.name} — ${projectInfo.location}`;
      pdf.text(headerText, 10, 12);

      const pageNumText = `Page ${i} of ${totalPages}`;
      const pageNumWidth =
        pdf.getStringUnitWidth(pageNumText) *
        (pdf.internal.getFontSize() / pdf.internal.scaleFactor);
      const rightEdgeX = pdf.internal.pageSize.getWidth() - 10;
      pdf.text(pageNumText, rightEdgeX - pageNumWidth, 12);

      // Top divider
      pdf.setDrawColor(203, 213, 225);
      pdf.line(10, 15, rightEdgeX, 15);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      const footerContent = `Generated by SnapWise • ${new Date().toLocaleString()}`;
      const footerWidth =
        pdf.getStringUnitWidth(footerContent) *
        (pdf.internal.getFontSize() / pdf.internal.scaleFactor);
      const bottomYLine = pdf.internal.pageSize.getHeight() - 15;
      pdf.line(10, bottomYLine, rightEdgeX, bottomYLine);
      pdf.text(footerContent, rightEdgeX - footerWidth, bottomYLine + 3);
    }

    return pdf.output("blob");
  }

  async function onDownloadPdf() {
    try {
      setDownloading(true);
      const blob = await buildPdfBlob(`${project?.name || "Project"}_report.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.name || "Project"}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF Download Failed:", e);
    } finally {
      setDownloading(false);
    }
  }

  /* ===== Render ===== */
  return (
    <section className="tf-right">
      <SlCard className="tf-card">
        <div slot="header" className="tf-right-head">
          <div className="tf-right-title">
            <SlIcon name="person-badge" />
            <span>Task &amp; User Details</span>
          </div>
          <SlDropdown placement="bottom-end">
            <SlButton slot="trigger" variant="text" size="small" circle>
              <SlIcon name="three-dots-vertical" />
            </SlButton>
            <SlMenu>
              <SlMenuItem onClick={onDownloadPdf}>
                <SlIcon slot="prefix" name="download" />
                Generate PDF Report
              </SlMenuItem>
            </SlMenu>
          </SlDropdown>
        </div>

        {downloading ? (
          <div className="tf-empty">
            <SlSpinner /> Generating PDF…
          </div>
        ) : loading ? (
          <div className="tf-empty">Loading…</div>
        ) : !taskData ? (
          <div className="tf-empty">Select a task to view details</div>
        ) : (
          <div className="tf-detail-wrap" ref={detailRef}>
            <div className="tf-detail-row">
              <div className="tf-detail-label">Project</div>
              <div className="tf-detail-value">{project?.name}</div>
            </div>
            <div className="tf-detail-row">
              <div className="tf-detail-label">Location</div>
              <div className="tf-detail-value">{project?.location}</div>
            </div>

            <SlDivider />

            <div className="tf-user">
              <SlAvatar
                image={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  project?.supervisor || "U"
                )}&background=EEE&color=111`}
                label="User"
                style={{ ["--size" as any]: "42px" }}
              />
              <div className="tf-user-info">
                <div className="tf-user-name">{project?.supervisor}</div>
              </div>
            </div>

            <SlDivider />

            <div className="tf-detail-label">
              Photos ({taskData.photos?.length || 0})
            </div>

            <div className="tf-photo-pair-grid">
              {photoPairs.map((p, i) => (
                <div key={p.pairId} className="tf-photo-pair-row">
                  <div className="tf-photo-pair">
                    <div className="tf-pair-label">Before {i + 1}</div>
                    {p.before ? (
                      <img src={imgSrc(p.before)} className="tf-photo-img" />
                    ) : (
                      <div className="tf-photo-placeholder">No Before</div>
                    )}
                  </div>
                  <div className="tf-photo-pair">
                    <div className="tf-pair-label">After {i + 1}</div>
                    {p.after ? (
                      <img src={imgSrc(p.after)} className="tf-photo-img" />
                    ) : (
                      <div className="tf-photo-placeholder">No After</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="tf-actions">
              <SlButton size="small" onClick={onBack}>
                <SlIcon name="arrow-left" /> Back
              </SlButton>
            </div>
          </div>
        )}
      </SlCard>
    </section>
  );
}
