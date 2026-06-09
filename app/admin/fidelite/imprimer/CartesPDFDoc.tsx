"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// ── Types ──────────────────────────────────────────────────────────────────
interface Carte {
  id: string;
  codeQR: string;
  qrDataUrl: string;
}

// ── Layout constants (mm) ──────────────────────────────────────────────────
// A4 = 210 × 297mm
// 2 cols × 85.6mm + 5mm gap = 176.2mm  →  margin X = (210-176.2)/2 = 16.9mm
// 5 rows × 54mm + 4 × 2mm gap = 278mm
// header zone = 14mm (top 5mm + header 7mm + gap 2mm)
// cards end at: 14 + 278 = 292mm  <  297mm ✓
const MX     = 16.9;   // side margin mm
const CARD_W = 85.6;
const CARD_H = 54;
const COL_GAP = 5;
const ROW_GAP = 2;
const HEADER_BOTTOM = 14; // top of first card row

const COL_X = [MX, MX + CARD_W + COL_GAP] as const;  // [16.9, 107.5]

function cardY(row: number): number {
  return HEADER_BOTTOM + row * (CARD_H + ROW_GAP);
}

function formatCode(code: string): string {
  return code.toUpperCase().match(/.{1,5}/g)?.join(" ") ?? code.toUpperCase();
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    width:           "210mm",
    height:          "297mm",
    backgroundColor: "#ffffff",
    fontFamily:      "Helvetica",
    position:        "relative",
  },

  // ── Page header (absolute) ────────────────────────────────────────────
  hdr: {
    position:        "absolute",
    top:             "5mm",
    left:            `${MX}mm`,
    right:           `${MX}mm`,
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    paddingBottom:   "1.5mm",
    borderBottomWidth: 0.4,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  hdrLeft: {
    flexDirection: "row",
    alignItems:    "center",
  },
  hdrLogoBox: {
    width:           "5mm",
    height:          "5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "1mm",
    justifyContent:  "center",
    alignItems:      "center",
    marginRight:     "2mm",
  },
  hdrLogoTxt: {
    color:      "#0F1F17",
    fontSize:   4,
    fontFamily: "Helvetica-Bold",
    textAlign:  "center",
    marginTop:  "0.8mm",
  },
  hdrBrand: {
    color:         "#1B4D3E",
    fontSize:      4.5,
    fontFamily:    "Helvetica-Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  hdrPage: {
    color:     "#94a3b8",
    fontSize:  4,
  },

  // ── Card (absolute, positioned via inline style) ──────────────────────
  card: {
    position:        "absolute",
    width:           `${CARD_W}mm`,
    height:          `${CARD_H}mm`,
    backgroundColor: "#1B4D3E",
    borderRadius:    "3.18mm",
    overflow:        "hidden",
  },

  // Gold stripe top
  stripe: {
    position:        "absolute",
    top:             0,
    left:            0,
    right:           0,
    height:          "0.8mm",
    backgroundColor: "#C8A96E",
  },

  // Card header row
  cHdr: {
    position:  "absolute",
    top:       "2.8mm",
    left:      "3.5mm",
    right:     "4mm",
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "flex-start",
  },
  cHdrLeft: {
    flexDirection: "row",
    alignItems:    "center",
  },
  logoBox: {
    width:           "7.5mm",
    height:          "7.5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "1.5mm",
    justifyContent:  "center",
    alignItems:      "center",
    marginRight:     "2mm",
  },
  logoTxt: {
    color:      "#0F1F17",
    fontSize:   5,
    fontFamily: "Helvetica-Bold",
    textAlign:  "center",
    marginTop:  "0.9mm",
  },
  brandName: {
    color:         "#C8A96E",
    fontSize:      5.5,
    fontFamily:    "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  brandSub: {
    color:    "#4D7A63",
    fontSize: 3.2,
    marginTop: "0.4mm",
  },
  maLabel: {
    color:         "#4D7A63",
    fontSize:      3,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign:     "right",
  },
  carteTxt: {
    color:         "#C8A96E",
    fontSize:      9,
    fontFamily:    "Helvetica-Bold",
    letterSpacing: -0.5,
    textAlign:     "right",
  },

  // Separator
  sep: {
    position:        "absolute",
    top:             "13.5mm",
    left:            "4mm",
    right:           "4mm",
    height:          "0.2mm",
    backgroundColor: "#224638",
  },

  // Body
  body: {
    position:      "absolute",
    top:           "14.5mm",
    left:          "4mm",
    right:         "4mm",
    bottom:        "8.5mm",
    flexDirection: "row",
    alignItems:    "center",
  },
  qrBox: {
    width:           "22mm",
    height:          "22mm",
    backgroundColor: "#ffffff",
    borderRadius:    "1.5mm",
    padding:         "1mm",
    marginRight:     "3mm",
    flexShrink:      0,
  },
  qrImg: {
    width:  "100%",
    height: "100%",
  },
  infoCol: {
    flex:          1,
    flexDirection: "column",
  },
  infoType: {
    color:         "#4D7A63",
    fontSize:      2.8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom:  "1.2mm",
  },
  infoPts: {
    color:        "#C8A96E",
    fontSize:     4,
    fontFamily:   "Helvetica-Bold",
    marginBottom: "0.8mm",
  },
  infoSeuil: {
    color:        "#5A8A6E",
    fontSize:     3.5,
    marginBottom: "1mm",
  },
  infoTel: {
    color:    "#5A8A6E",
    fontSize: 3.2,
  },

  // Footer
  footer: {
    position:        "absolute",
    bottom:          0,
    left:            0,
    right:           0,
    height:          "8.5mm",
    backgroundColor: "#13372D",
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    paddingLeft:     "4mm",
    paddingRight:    "4mm",
  },
  ftrLabel: {
    color:         "#4D7A63",
    fontSize:      2.8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom:  "0.4mm",
  },
  ftrCode: {
    color:         "#C4D4CC",
    fontSize:      3.8,
    fontFamily:    "Courier",
    letterSpacing: 0.8,
  },
  ftrChip: {
    width:           "6mm",
    height:          "4.5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "0.8mm",
  },
});

// ── Single card ─────────────────────────────────────────────────────────────
function CardPDF({ carte, col, row }: { carte: Carte; col: number; row: number }) {
  const x = COL_X[col as 0 | 1];
  const y = cardY(row);

  return (
    <View style={[S.card, { top: `${y}mm`, left: `${x}mm` }]}>
      {/* Gold stripe */}
      <View style={S.stripe} />

      {/* Header */}
      <View style={S.cHdr}>
        <View style={S.cHdrLeft}>
          <View style={S.logoBox}>
            <Text style={S.logoTxt}>R</Text>
          </View>
          <View>
            <Text style={S.brandName}>Rihanala Village</Text>
            <Text style={S.brandSub}>Foulpointe · Madagascar</Text>
          </View>
        </View>
        <View>
          <Text style={S.maLabel}>ma</Text>
          <Text style={S.carteTxt}>carte</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={S.sep} />

      {/* Body */}
      <View style={S.body}>
        <View style={S.qrBox}>
          {carte.qrDataUrl
            ? <Image style={S.qrImg} src={carte.qrDataUrl} />
            : null}
        </View>
        <View style={S.infoCol}>
          <Text style={S.infoType}>Carte de fidélité</Text>
          <Text style={S.infoPts}>1 point / 5 000 Ar</Text>
          <Text style={S.infoSeuil}>100 pts → 50 000 Ar</Text>
          <Text style={S.infoTel}>+261 34 68 084 66</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={S.footer}>
        <View>
          <Text style={S.ftrLabel}>N° carte</Text>
          <Text style={S.ftrCode}>{formatCode(carte.codeQR)}</Text>
        </View>
        <View style={S.ftrChip} />
      </View>
    </View>
  );
}

// ── PDF Document ────────────────────────────────────────────────────────────
interface CartesPDFDocProps {
  pages: Carte[][];
}

export function CartesPDFDoc({ pages }: CartesPDFDocProps) {
  const total = pages.length;
  return (
    <Document>
      {pages.map((pageCards, pageIdx) => (
        <Page key={pageIdx} size="A4" style={S.page}>
          {/* Page header */}
          <View style={S.hdr}>
            <View style={S.hdrLeft}>
              <View style={S.hdrLogoBox}>
                <Text style={S.hdrLogoTxt}>R</Text>
              </View>
              <Text style={S.hdrBrand}>Rihanala Village · Cartes Fidélité</Text>
            </View>
            <Text style={S.hdrPage}>Page {pageIdx + 1} / {total}</Text>
          </View>

          {/* Cards — absolute positioning, exact coordinates */}
          {pageCards.map((carte, i) => (
            <CardPDF
              key={carte.id}
              carte={carte}
              col={i % 2 as 0 | 1}
              row={Math.floor(i / 2)}
            />
          ))}
        </Page>
      ))}
    </Document>
  );
}
