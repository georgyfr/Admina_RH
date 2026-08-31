import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Genere un fichier .docx structure a partir des donnees du Studio.
 * @param {object} data - Toutes les donnees du formulaire Studio
 */
export async function exportPosteAsDocx(data) {
  const fmt = (n) => (n ? n.toLocaleString('fr-FR') + ' FCFA' : 'Non precise');
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (tmp) { tmp.innerHTML = html; return tmp.textContent || tmp.innerText || ''; }
    return html.replace(/<[^>]*>/g, '');
  };

  const children = [];

  /* Titre */
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'FICHE DE POSTE', bold: true, size: 32, color: '1565c0' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  /* Intitule */
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.intitule || 'Poste non precise', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 100 },
    }),
  );

  /* Meta */
  const metaLine = [
    data.departement || '',
    data.typePoste || '',
    data.typeContrat || '',
  ].filter(Boolean).join(' | ');
  children.push(
    new Paragraph({
      children: [new TextRun({ text: metaLine, italics: true, color: '666666', size: 22 })],
      spacing: { after: 300 },
    }),
  );

  /* Separateur */
  const sep = () =>
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      spacing: { after: 200 },
    });

  /* Section helper */
  const section = (title, text) => {
    const result = [];
    result.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 24, color: '0D7C66' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    );
    if (text) {
      text.split('\n').forEach((line) => {
        result.push(
          new Paragraph({
            children: [new TextRun({ text: line || ' ', size: 22 })],
            spacing: { after: 60 },
          }),
        );
      });
    }
    return result;
  };

  /* Contexte */
  children.push(sep());
  children.push(...section('Contexte et Analyse du Besoin', stripHtml(data.contexte)));

  /* Missions */
  children.push(sep());
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Missions et Responsabilites Principales', bold: true, size: 24, color: '0D7C66' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
  );
  (data.missions || []).forEach((m, i) => {
    if (m.text?.trim()) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${i + 1}. ${m.text}`, size: 22 })],
          spacing: { after: 60 },
          bullet: { level: 0 },
        }),
      );
    }
  });

  /* Profil */
  children.push(sep());
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Profil Recherche', bold: true, size: 24, color: '0D7C66' })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
  );
  if (data.niveauEtude) children.push(new Paragraph({ children: [new TextRun({ text: `Niveau d'etudes : ${data.niveauEtude}`, size: 22 })], spacing: { after: 60 } }));
  if (data.experience) children.push(new Paragraph({ children: [new TextRun({ text: `Experience : ${data.experience}`, size: 22 })], spacing: { after: 60 } }));
  if ((data.hardSkills || []).length) children.push(new Paragraph({ children: [new TextRun({ text: `Savoir-faire : ${data.hardSkills.join(', ')}`, size: 22 })], spacing: { after: 60 } }));
  if ((data.softSkills || []).length) children.push(new Paragraph({ children: [new TextRun({ text: `Savoir-etre : ${data.softSkills.join(', ')}`, size: 22 })], spacing: { after: 60 } }));
  if ((data.langues || []).length) {
    data.langues.forEach((l) => {
      if (l.langue) children.push(new Paragraph({ children: [new TextRun({ text: `${l.langue} - ${l.niveau || 'Non precise'}`, size: 22 })], spacing: { after: 40 } }));
    });
  }

  /* Conditions */
  children.push(sep());
  children.push(...section('Conditions et Avantages', null));
  children.push(new Paragraph({ children: [new TextRun({ text: `Remuneration : ${fmt(data.salaireMin)} - ${fmt(data.salaireMax)}`, size: 22 })], spacing: { after: 60 } }));
  if ((data.avantages || []).length) {
    children.push(new Paragraph({ children: [new TextRun({ text: `Avantages : ${data.avantages.join(', ')}`, size: 22 })], spacing: { after: 60 } }));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = (data.intitule || 'fiche_poste').replace(/[^a-zA-Z0-9\-_\s\xc0-\xff]/g, '').replace(/\s+/g, '_');
  saveAs(blob, `${safeName}_fiche_poste.docx`);
}
