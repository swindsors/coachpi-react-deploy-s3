import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, Packer } from 'docx';
import { saveAs } from 'file-saver';

export const generateReport = async (projectData) => {
  const sections = [];

  // Title Page
  sections.push(
    new Paragraph({
      text: 'Six Sigma DMAIC Project Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: projectData.projectName || 'Untitled Project',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    })
  );

  // Define Phase
  sections.push(
    new Paragraph({
      text: 'DEFINE PHASE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Problem Statement',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.problemStatement || 'Not provided',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'Key Stakeholders',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    })
  );

  if (projectData.stakeholders && projectData.stakeholders.length > 0) {
    projectData.stakeholders.forEach((stakeholder) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${stakeholder.name}`, bold: true }),
            new TextRun({ text: ` (${stakeholder.raci})` })
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `   Email: ${stakeholder.email}`,
          spacing: { after: 100 }
        })
      );
    });
  } else {
    sections.push(new Paragraph({ text: 'No stakeholders defined', spacing: { after: 200 } }));
  }

  sections.push(
    new Paragraph({
      text: 'Project Scope',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.scope || 'Not provided',
      spacing: { after: 200 }
    })
  );

  // SIPOC Diagrams
  if (projectData.sipocDiagrams && projectData.sipocDiagrams.length > 0) {
    sections.push(
      new Paragraph({
        text: 'SIPOC Diagrams',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    projectData.sipocDiagrams.forEach((sipoc, index) => {
      sections.push(
        new Paragraph({
          text: `${index + 1}. ${sipoc.processName}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 100, after: 100 }
        })
      );

      // Create SIPOC table
      const sipocTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Suppliers', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Inputs', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Process', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Outputs', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Customers', bold: true })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: sipoc.suppliers.map(s => new Paragraph({ text: `• ${s}` })) }),
              new TableCell({ children: sipoc.inputs.map(i => new Paragraph({ text: `• ${i}` })) }),
              new TableCell({ children: sipoc.processSteps.map((p, i) => new Paragraph({ text: `${i + 1}. ${p}` })) }),
              new TableCell({ children: sipoc.outputs.map(o => new Paragraph({ text: `• ${o}` })) }),
              new TableCell({ children: sipoc.customers.map(c => new Paragraph({ text: `• ${c}` })) })
            ]
          })
        ]
      });

      sections.push(sipocTable);
      sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    });
  }

  // Measure Phase
  sections.push(
    new Paragraph({
      text: 'MEASURE PHASE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })
  );

  if (projectData.metrics && projectData.metrics.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Key Performance Indicators',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    projectData.metrics.forEach((metric, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${metric.name}`, bold: true }),
            new TextRun({ text: ` (${metric.type || 'Primary'})`, italics: true }),
            new TextRun({ text: `: Baseline: ${metric.baseline} ${metric.unit}, Target: ${metric.target} ${metric.unit}` })
          ],
          spacing: { after: 100 }
        })
      );
    });
  } else {
    sections.push(new Paragraph({ text: 'No metrics defined', spacing: { after: 200 } }));
  }

  // Analyze Phase
  sections.push(
    new Paragraph({
      text: 'ANALYZE PHASE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Data Analysis Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.dataAnalysis || 'Not provided',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'Root Causes Identified',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.rootCauses || 'Not provided',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'Key Findings',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.keyFindings || 'Not provided',
      spacing: { after: 200 }
    })
  );

  // 5 Whys Analyses
  if (projectData.fiveWhysResults && projectData.fiveWhysResults.length > 0) {
    sections.push(
      new Paragraph({
        text: '5 Whys Analyses',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    );

    projectData.fiveWhysResults.forEach((analysis, index) => {
      sections.push(
        new Paragraph({
          text: `Analysis ${index + 1}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 100, after: 50 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Problem: ', bold: true }),
            new TextRun({ text: analysis.problem })
          ],
          spacing: { after: 100 }
        })
      );

      analysis.whys.forEach((why, whyIndex) => {
        sections.push(
          new Paragraph({
            text: `Why ${whyIndex + 1}: ${why}`,
            spacing: { after: 50 }
          })
        );
      });

      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Root Cause: ', bold: true }),
            new TextRun({ text: analysis.rootCause })
          ],
          spacing: { after: 200 }
        })
      );
    });
  }

  // Improve Phase
  sections.push(
    new Paragraph({
      text: 'IMPROVE PHASE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Improvement Actions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    })
  );

  if (projectData.improvements && projectData.improvements.length > 0) {
    projectData.improvements.forEach((improvement, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun({ text: improvement.action })
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `   Owner: ${improvement.owner || 'Unassigned'} | Timeline: ${improvement.timeline || 'Not set'} | Status: ${improvement.status}`,
          spacing: { after: 100 }
        })
      );
    });
  } else {
    sections.push(new Paragraph({ text: 'No improvement actions defined', spacing: { after: 200 } }));
  }

  // Control Phase
  sections.push(
    new Paragraph({
      text: 'CONTROL PHASE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Control Measures',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    })
  );

  if (projectData.controls && projectData.controls.length > 0) {
    projectData.controls.forEach((control, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun({ text: control.measure })
          ],
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: `   Frequency: ${control.frequency} | Responsible: ${control.responsible}`,
          spacing: { after: 100 }
        })
      );
    });
  } else {
    sections.push(new Paragraph({ text: 'No control measures defined', spacing: { after: 200 } }));
  }

  sections.push(
    new Paragraph({
      text: 'Process Documentation',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      text: projectData.documentation || 'Not provided',
      spacing: { after: 200 }
    })
  );

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  return doc;
};

export const downloadReport = async (projectData) => {
  try {
    const doc = await generateReport(projectData);
    const blob = await Packer.toBlob(doc);
    const fileName = `${projectData.projectName || 'DMAIC-Project'}_Report_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};
