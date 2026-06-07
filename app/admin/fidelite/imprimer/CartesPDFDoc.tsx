"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// ── Types ──────────────────────────────────────────────────────────────────
interface Carte {
  id: string;
  codeQR: string;
  qrDataUrl: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCode(code: string): string {
  return code.toUpperCase().match(/.{1,5}/g)?.join(" ") ?? code.toUpperCase();
}

// ── Colors (no rgba — @react-pdf/renderer uses solid hex only) ─────────────
// rgba(0,0,0,0.28)   on #1B4D3E  → #13372D
// rgba(200,169,110,0.18) on #1B4D3E → #224638
// rgba(255,255,255,0.38) on #1B4D3E → #5A8A6E
// rgba(255,255,255,0.30) on #1B4D3E → #4D7A63
// rgba(255,255,255,0.82) on #1B4D3E → #C4D4CC

// ── Layout math ───────────────────────────────────────────────────────────
// A4 = 210mm × 297mm
// 2 cols × 85.6mm + 5mm col gap = 176.2mm  →  side margin = (210-176.2)/2 = 16.9mm
// Row gap = 2mm
// 5 rows × 54mm + 4 × 2mm = 278mm
// Header = 7mm  →  Top pad 5mm + header 7mm + 2mm gap + 278mm cards + 5mm bot = 297mm ✓
const S = StyleSheet.create({
  // ── A4 page
  page: {
    width:           "210mm",
    height:          "297mm",
    backgroundColor: "#ffffff",
    fontFamily:      "Helvetica",
  },

  // ── Page header
  pageHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginLeft:     "16.9mm",
    marginRight:    "16.9mm",
    marginTop:      "5mm",
    paddingBottom:  "1.5mm",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    marginBottom:   "2mm",
  },
  pageHeaderLeft: {
    flexDirection: "row",
    alignItems:    "center",
  },
  pageHeaderLogoBox: {
    width:           "5mm",
    height:          "5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "1mm",
    justifyContent:  "center",
    alignItems:      "center",
    marginRight:     "2mm",
  },
  pageHeaderLogoText: {
    color:      "#0F1F17",
    fontSize:   4,
    fontFamily: "Helvetica-Bold",
    textAlign:  "center",
  },
  pageHeaderBrand: {
    color:          "#1B4D3E",
    fontSize:       4.5,
    fontFamily:     "Helvetica-Bold",
    letterSpacing:  0.3,
    textTransform:  "uppercase",
  },
  pageHeaderNum: {
    color:     "#94a3b8",
    fontSize:  4,
    fontFamily: "Helvetica",
  },

  // ── Cards grid
  cardGrid: {
    flexDirection: "row",
    flexWrap:      "wrap",
    marginLeft:    "16.9mm",
  },

  // ── Individual card
  card: {
    width:           "85.6mm",
    height:          "54mm",
    backgroundColor: "#1B4D3E",
    borderRadius:    "3.18mm",
    overflow:        "hidden",
    position:        "relative",
    marginBottom:    "2mm",
  },
  cardRightGap: {
    marginRight: "5mm",
  },

  // Gold top stripe
  goldStripe: {
    position:        "absolute",
    top:             0,
    left:            0,
    right:           0,
    height:          "0.8mm",
    backgroundColor: "#C8A96E",
  },

  // Diagonal shimmer (solid, subtle)
  diagonalShimmer: {
    position:        "absolute",
    top:             "-8mm",
    right:           "8mm",
    width:           "15mm",
    height:          "70mm",
    backgroundColor: "#1E5441",  // slightly lighter green
    transform:       "rotate(20deg)",
  },

  // Card header row
  cardHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    paddingLeft:    "3.5mm",
    paddingRight:   "4mm",
    paddingTop:     "3.5mm",
    paddingBottom:  "2mm",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems:    "center",
  },
  cardLogoBox: {
    width:           "7.5mm",
    height:          "7.5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "1.5mm",
    justifyContent:  "center",
    alignItems:      "center",
    marginRight:     "2mm",
  },
  cardLogoText: {
    color:      "#0F1F17",
    fontSize:   5,
    fontFamily: "Helvetica-Bold",
    textAlign:  "center",
  },
  cardBrandName: {
    color:         "#C8A96E",
    fontSize:      5.5,
    fontFamily:    "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardBrandSub: {
    color:    "#4D7A63",
    fontSize: 3.2,
    marginTop: "0.5mm",
  },
  cardMaLabel: {
    color:         "#4D7A63",
    fontSize:      3,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign:     "right",
  },
  cardCarteText: {
    color:         "#C8A96E",
    fontSize:      9,
    fontFamily:    "Helvetica-Bold",
    letterSpacing: -0.5,
    textAlign:     "right",
  },

  // Separator
  separator: {
    height:          "0.2mm",
    backgroundColor: "#224638",
    marginLeft:      "4mm",
    marginRight:     "4mm",
  },

  // Card body
  cardBody: {
    flex:          1,
    flexDirection: "row",
    alignItems:    "center",
    paddingLeft:   "4mm",
    paddingRight:  "4mm",
    paddingTop:    "2mm",
    paddingBottom: "2mm",
  },
  qrWrap: {
    width:           "23mm",
    height:          "23mm",
    backgroundColor: "#ffffff",
    borderRadius:    "1.5mm",
    padding:         "1mm",
    marginRight:     "3.5mm",
    flexShrink:      0,
  },
  qrImage: {
    width:  "100%",
    height: "100%",
  },
  cardInfoCol: {
    flex:          1,
    flexDirection: "column",
  },
  cardInfoType: {
    color:         "#4D7A63",
    fontSize:      2.8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom:  "1.5mm",
  },
  cardInfoPts: {
    color:         "#C8A96E",
    fontSize:      4,
    fontFamily:    "Helvetica-Bold",
    marginBottom:  "1mm",
  },
  cardInfoSeuil: {
    color:        "#5A8A6E",
    fontSize:     3.5,
    marginBottom: "1.5mm",
  },
  cardInfoTel: {
    color:    "#5A8A6E",
    fontSize: 3.2,
  },

  // Footer
  cardFooter: {
    backgroundColor: "#13372D",
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    paddingLeft:     "4mm",
    paddingRight:    "4mm",
    paddingTop:      "1.5mm",
    paddingBottom:   "2mm",
  },
  footerCodeLabel: {
    color:         "#4D7A63",
    fontSize:      2.8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom:  "0.4mm",
  },
  footerCodeText: {
    color:         "#C4D4CC",
    fontSize:      3.8,
    fontFamily:    "Courier",
    letterSpacing: 0.8,
  },
  footerChip: {
    width:           "6mm",
    height:          "4.5mm",
    backgroundColor: "#C8A96E",
    borderRadius:    "0.8mm",
  },
});

// ── Single card ─────────────────────────────────────────────────────────────
function LoyaltyCardPDF({ carte, isLeft }: { carte: Carte; isLeft: boolean }) {
  return (
    <View style={[S.card, isLeft && S.cardRightGap]}>
      {/* Gold stripe */}
      <View style={S.goldStripe} />

      {/* Subtle diagonal shimmer */}
      <View style={S.diagonalShimmer} />

      {/* Header */}
      <View style={S.cardHeader}>
        <View style={S.cardHeaderLeft}>
          <View style={S.cardLogoBox}>
            <Text style={S.cardLogoText}>R</Text>
          </View>
          <View>
            <Text style={S.cardBrandName}>Rihanala Village</Text>
            <Text style={S.cardBrandSub}>Foulpointe · Madagascar</Text>
          </View>
        </View>
        <View>
          <Text style={S.cardMaLabel}>ma</Text>
          <Text style={S.cardCarteText}>carte</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={S.separator} />

      {/* Body */}
      <View style={S.cardBody}>
        {carte.qrDataUrl ? (
          <View style={S.qrWrap}>
            <Image style={S.qrImage} src={carte.qrDataUrl} />
          </View>
        ) : (
          <View style={S.qrWrap} />
        )}
        <View style={S.cardInfoCol}>
          <Text style={S.cardInfoType}>Carte de fidélité</Text>
          <Text style={S.cardInfoPts}>1 point / 5 000 Ar</Text>
          <Text style={S.cardInfoSeuil}>100 pts → 50 000 Ar</Text>
          <Text style={S.cardInfoTel}>+261 34 68 084 66</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={S.cardFooter}>
        <View>
          <Text style={S.footerCodeLabel}>N° carte</Text>
          <Text style={S.footerCodeText}>{formatCode(carte.codeQR)}</Text>
        </View>
        <View style={S.footerChip} />
      </View>
    </View>
  );
}

// ── PDF Document (exported for use with pdf() function) ────────────────────
interface CartesPDFDocProps {
  pages: Carte[][];
}

export function CartesPDFDoc({ pages }: CartesPDFDocProps) {
  const totalPages = pages.length;
  return (
    <Document>
      {pages.map((pageCards, pageIdx) => (
        <Page key={pageIdx} size="A4" style={S.page}>
          {/* Page header */}
          <View style={S.pageHeader}>
            <View style={S.pageHeaderLeft}>
              <View style={S.pageHeaderLogoBox}>
                <Text style={S.pageHeaderLogoText}>R</Text>
              </View>
              <Text style={S.pageHeaderBrand}>
                Rihanala Village · Cartes Fidélité
              </Text>
            </View>
            <Text style={S.pageHeaderNum}>
              Page {pageIdx + 1} / {totalPages}
            </Text>
          </View>

          {/* Card grid */}
          <View style={S.cardGrid}>
            {pageCards.map((carte, i) => (
              <LoyaltyCardPDF
                key={carte.id}
                carte={carte}
                isLeft={i % 2 === 0}
              />
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
