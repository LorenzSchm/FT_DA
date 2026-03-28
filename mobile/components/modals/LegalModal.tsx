import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  type: "privacy" | "terms";
};

export default function LegalModal({ isVisible, onClose, type }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const iosShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  };
  const shadowStyle = Platform.select({ ios: iosShadow });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 2,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) sheetPosition.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) handleClose();
        else
          Animated.spring(sheetPosition, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    }),
  ).current;

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);
      Animated.spring(sheetPosition, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      onClose();
    });
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            transform: [{ translateY: sheetPosition }],
            backgroundColor: "white",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            minHeight: SCREEN_HEIGHT,
            maxHeight: SCREEN_HEIGHT,
            ...shadowStyle,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View
              {...panResponder.panHandlers}
              style={{
                height: 40,
                marginTop: 10,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#d1d5db",
                  width: 50,
                  height: 5,
                  borderRadius: 999,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#000" }}>
                {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#6b7280" }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1, paddingHorizontal: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {type === "privacy" ? <PrivacyPolicyContent /> : <TermsContent />}
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ─── Privacy Policy (React Native version of webapp content) ─── */
function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 14,
        color: "#374151",
        lineHeight: 21,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 14,
        color: "#374151",
        lineHeight: 21,
        marginBottom: 4,
        paddingLeft: 12,
      }}
    >
      {"\u2022"} {children}
    </Text>
  );
}

function PrivacyPolicyContent() {
  return (
    <View>
      <P>Last updated: 2. January 2026</P>
      <P>
        This Privacy Notice explains how personal data is processed in
        connection with the Finance Tracker application and the associated
        website.
      </P>
      <P>
        The project is a non-commercial diploma thesis developed at HTL Rennweg
        and is intended solely for educational and demonstration purposes.
      </P>

      <SectionTitle>1. Data Controller</SectionTitle>
      <P>Project: Finance Tracker (Diploma Thesis)</P>
      <P>Responsible Entity: Project Team "Finance Tracker" — Lorenz Schmidt</P>
      <P>Email: Lorenz.schmidt@htl.rennweg.at</P>

      <SectionTitle>2. Nature of the Project</SectionTitle>
      <Bullet>
        The Finance Tracker app is not a commercial product and does not provide
        financial, investment, or banking advice.
      </Bullet>
      <Bullet>
        The app allows users to view and analyze their own financial data for
        informational and statistical purposes only.
      </Bullet>

      <SectionTitle>3. Data We Process</SectionTitle>
      <P>
        With the user's explicit consent, the following categories of personal
        data may be processed:
      </P>
      <Bullet>Account balances</Bullet>
      <Bullet>Transaction data (amounts, dates, descriptions)</Bullet>
      <Bullet>Categories of income and expenses</Bullet>
      <Bullet>Account and bank-related metadata</Bullet>
      <P>
        No login credentials, passwords, PINs, or TANs are processed or stored
        by the project team.
      </P>

      <SectionTitle>4. Source of the Data & Third-Party Provider</SectionTitle>
      <P>
        Bank account data is accessed exclusively via the third-party open
        banking provider TrueLayer. Authentication and data access occur
        directly between the user and their bank via TrueLayer. The project team
        does not receive or store banking credentials at any time.
      </P>

      <SectionTitle>5. Purpose of Data Processing</SectionTitle>
      <Bullet>Displaying personal financial overviews</Bullet>
      <Bullet>Generating statistics (e.g. expenses, income, savings)</Bullet>
      <Bullet>Visualizing financial trends for the user</Bullet>
      <P>
        The data is not modified, not shared, and not used for automated
        decision-making.
      </P>

      <SectionTitle>6. Storage of Data</SectionTitle>
      <Bullet>
        Financial data is stored exclusively locally on the user's device, or
        temporarily processed on a server as described in the app or
        documentation.
      </Bullet>
      <Bullet>
        The project team and the school have no access to users' financial data.
      </Bullet>

      <SectionTitle>7. Legal Basis</SectionTitle>
      <P>
        The processing of personal data is based on Article 6(1)(a) GDPR —
        Explicit user consent. Consent can be withdrawn at any time by
        disconnecting bank accounts or uninstalling the app.
      </P>

      <SectionTitle>8. Data Retention</SectionTitle>
      <P>
        Data is retained as long as the user actively uses the app or the data
        is stored locally on the user's device. When the app is uninstalled, all
        locally stored data is deleted.
      </P>

      <SectionTitle>9. User Rights</SectionTitle>
      <P>Under the GDPR, users have the right to:</P>
      <Bullet>Access their personal data</Bullet>
      <Bullet>Rectify inaccurate data</Bullet>
      <Bullet>Request deletion of data</Bullet>
      <Bullet>Restrict processing</Bullet>
      <Bullet>Data portability</Bullet>
      <Bullet>Withdraw consent at any time</Bullet>

      <SectionTitle>10. Data Security</SectionTitle>
      <P>
        Appropriate technical and organizational measures are implemented to
        protect data against unauthorized access, loss, or misuse. However, as
        this is an educational project, no guarantee of uninterrupted
        availability or absolute security can be provided.
      </P>

      <SectionTitle>11. Changes to This Privacy Notice</SectionTitle>
      <P>
        This Privacy Notice may be updated as part of the ongoing development of
        the diploma thesis. The current version will always be available on the
        website.
      </P>

      <SectionTitle>12. Contact</SectionTitle>
      <P>
        Lorenz Schmidt{"\n"}Rennweg 89b, 1030 Vienna{"\n"}Email:
        Lorenz.schmidt@htl.rennweg.at
      </P>
    </View>
  );
}

/* ─── Terms of Service (React Native version of webapp content) ─── */
function TermsContent() {
  return (
    <View>
      <P>Last Updated: 2. January 2026</P>
      <P>
        These Terms of Service govern the use of the Finance Tracker Application
        and the associated website, developed as part of a non-commercial
        diploma thesis at HTL Rennweg. By using the App or Website, you agree to
        these Terms.
      </P>

      <SectionTitle>1. Purpose of the Application</SectionTitle>
      <Bullet>
        The App is a non-commercial educational project created solely for
        demonstration and training purposes.
      </Bullet>
      <Bullet>
        It provides users with visual overviews, statistics, and summaries of
        their personal financial data.
      </Bullet>
      <Bullet>
        The App does not provide financial advice, investment recommendations,
        or banking services.
      </Bullet>

      <SectionTitle>2. Eligibility</SectionTitle>
      <Bullet>
        The App is intended for users who are legally permitted to manage their
        own financial data.
      </Bullet>
      <Bullet>
        Use of the App by minors may require parental consent, depending on
        local legal requirements.
      </Bullet>

      <SectionTitle>3. Use of Third-Party Services</SectionTitle>
      <P>
        The App retrieves financial information exclusively through the external
        open-banking service provider TrueLayer. By connecting a bank account,
        the user agrees to TrueLayer's separate terms and privacy policies.
      </P>
      <P>The project team does not receive or store:</P>
      <Bullet>bank login credentials</Bullet>
      <Bullet>passwords, PINs or TANs</Bullet>
      <Bullet>direct access tokens</Bullet>

      <SectionTitle>4. User Responsibilities</SectionTitle>
      <Bullet>
        Provide accurate information when connecting bank accounts.
      </Bullet>
      <Bullet>Use the App only for personal, non-commercial purposes.</Bullet>
      <Bullet>
        Not attempt to manipulate, reverse engineer, or misuse the App or its
        APIs.
      </Bullet>
      <Bullet>
        Ensure the device they use is secure (e.g., protected by passwords or
        biometrics).
      </Bullet>

      <SectionTitle>5. Data Processing and Storage</SectionTitle>
      <Bullet>
        The App processes financial data only with the user's explicit consent.
      </Bullet>
      <Bullet>
        Data is stored exclusively locally on the user's device, or temporarily
        processed on a server defined in the Privacy Policy.
      </Bullet>
      <Bullet>
        The project team and the school do not have access to user financial
        data at any time.
      </Bullet>

      <SectionTitle>6. No Warranty / Educational Purpose Only</SectionTitle>
      <P>
        The App is provided "as is" without any warranties of any kind. No
        guarantee is made regarding accuracy, reliability, completeness, or
        availability. Calculations and statistics may contain errors. The App
        may be discontinued or modified at any time without notice.
      </P>
      <P>
        Users are advised not to rely on the App for financial decision-making.
      </P>

      <SectionTitle>7. Limitation of Liability</SectionTitle>
      <P>
        To the maximum extent permitted by law, the project team, the school,
        and all contributors disclaim liability for loss of data, financial
        damages, incorrect calculations, unauthorized access caused by the
        user's own device, or any issues arising from third-party providers.
      </P>

      <SectionTitle>8. Intellectual Property</SectionTitle>
      <P>
        All code, text, graphics, and design elements remain the property of the
        diploma thesis developers or their respective copyright holders. Users
        are not permitted to copy, distribute, resell, or modify the App without
        permission.
      </P>

      <SectionTitle>9. Termination of Use</SectionTitle>
      <P>
        The project team reserves the right to suspend access, discontinue the
        project, or terminate features at any time.
      </P>

      <SectionTitle>10. Governing Law</SectionTitle>
      <P>
        These Terms are governed by Austrian law, excluding conflict-of-law
        rules. Since the project is educational, no commercial jurisdiction or
        consumer arbitration applies.
      </P>

      <SectionTitle>11. Contact Information</SectionTitle>
      <P>Lorenz.schmidt@htl.rennweg.at{"\n"}Loreine.maly@htl.rennweg.at</P>
      <P>
        HTL Rennweg{"\n"}Rennweg 89b{"\n"}1030 Vienna, Austria{"\n"}
        sekretariat@htl.rennweg.at{"\n"}Phone: +43 1 242 15-10
      </P>
    </View>
  );
}
