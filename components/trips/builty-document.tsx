import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { builtyBalance, formatBuiltyPdfAmount } from "@/lib/calculations/builty";
import type { Builty } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 132,
    height: 44,
    objectFit: "contain",
  },
  brandName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    letterSpacing: 1.5,
  },
  meta: {
    marginTop: 3,
    fontSize: 11,
  },
  table: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  cell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#1a1a1a",
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellWide: {
    flex: 2,
  },
  label: {
    fontSize: 8,
    letterSpacing: 0.6,
    color: "#555555",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  goods: {
    fontSize: 11,
    lineHeight: 1.4,
  },
  spacer: {
    flexGrow: 1,
  },
  signature: {
    marginTop: 28,
    alignItems: "flex-end",
  },
  signLine: {
    width: 190,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 10,
  },
});

function Cell({
  label,
  children,
  wide = false,
  last = false,
}: {
  label: string;
  children: string;
  wide?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.cell, wide ? styles.cellWide : {}, last ? styles.cellLast : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={label === "Goods" ? styles.goods : styles.value}>{children}</Text>
    </View>
  );
}

export function BuiltyDocument({
  builty,
  logoSrc,
}: {
  builty: Builty;
  logoSrc: string | null;
}) {
  const balance = builtyBalance(builty.freight_amount, builty.advance_amount);

  return (
    <Document title={`Builty ${builty.builty_number}`} author="MK Transport">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
            <Text style={styles.brandName}>MK Transport</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>BUILTY</Text>
            <Text style={styles.meta}>{builty.builty_number}</Text>
            <Text style={styles.meta}>{formatDate(builty.builty_date)}</Text>
          </View>
        </View>

        <View style={styles.table} wrap={false}>
          <View style={[styles.row, styles.rowFirst]}>
            <Cell label="Customer" wide>
              {builty.customer_name}
            </Cell>
            <Cell label="Truck" last>
              {builty.truck_registration}
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell label="From">{builty.from_location}</Cell>
            <Cell label="To" last>
              {builty.to_location}
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell label="Goods" wide>
              {builty.goods_description}
            </Cell>
            <Cell label="Packages" last>
              {String(builty.package_count)}
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell label="Freight">{formatBuiltyPdfAmount(builty.freight_amount)}</Cell>
            <Cell label="Advance">{formatBuiltyPdfAmount(builty.advance_amount)}</Cell>
            <Cell label="Balance" last>
              {formatBuiltyPdfAmount(balance)}
            </Cell>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.signature} wrap={false}>
          <Text style={styles.signLine}>Signature</Text>
        </View>
      </Page>
    </Document>
  );
}
