import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  cottonRose: "#E5C1BD",
  bone: "#D2D0BA",
  drySage: "#B6BE9C",
  mutedTeal: "#7B9E87",
  blueSlate: "#5E747F",
  white: "#FFFFFF",
  ink: "#26373D",
  softInk: "#647278",
  border: "#E5E7DC",
  success: "#527A62",
};

const MOCK_PROVIDERS = [
  {
    id: 2,
    name: "Fast Fix Electricians",
    category: "Electrician",
    zone: "Johar",
    rating: 4.2,
    description: "Quick, careful electrical help for your home.",
    initials: "FE",
  },
  {
    id: 6,
    name: "Quick Electric Johar",
    category: "Electrician",
    zone: "Johar",
    rating: 3.7,
    description: "Friendly local electrician for everyday fixes.",
    initials: "QJ",
  },
  {
    id: 1,
    name: "Ali Plumbing Services",
    category: "Plumber",
    zone: "Gulshan",
    rating: 4.5,
    description: "Reliable plumbing support when you need it.",
    initials: "AP",
  },
];

function PrimaryButton({ children, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.disabledButton]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ children, onPress }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.secondaryButton}
    >
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

function Header({ title, subtitle, onBack, onHelp }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandMarkSmall}>
            <Text style={styles.brandMarkText}>A</Text>
          </View>
        )}
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {onHelp ? (
          <TouchableOpacity accessibilityLabel="Open user guide" onPress={onHelp} style={styles.helpButton}>
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function BottomNav({ active, onHome, onBookings, onHelp }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={onHome} style={styles.navItem}>
        <Text style={[styles.navIcon, active === "home" && styles.activeNavText]}>⌂</Text>
        <Text style={[styles.navLabel, active === "home" && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBookings} style={styles.navItem}>
        <Text style={[styles.navIcon, active === "bookings" && styles.activeNavText]}>▣</Text>
        <Text style={[styles.navLabel, active === "bookings" && styles.activeNavText]}>Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onHelp} style={styles.navItem}>
        <Text style={styles.navIcon}>ⓘ</Text>
        <Text style={styles.navLabel}>Guide</Text>
      </TouchableOpacity>
    </View>
  );
}

function WelcomeScreen({ onStart, onLogin, onHelp }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.welcomeContainer}>
        <View style={styles.welcomeArt}>
          <View style={styles.sunCircle} />
          <View style={styles.artCard}>
            <Text style={styles.artEmoji}>⌂</Text>
          </View>
          <View style={styles.artBadge}>
            <Text style={styles.artBadgeText}>★</Text>
          </View>
        </View>
        <Text style={styles.logo}>Amigo</Text>
        <Text style={styles.welcomeTitle}>Helpful hands, right when you need them.</Text>
        <Text style={styles.welcomeText}>
          Tell us what you need in your own words. Amigo helps you find a trusted local service without the confusion.
        </Text>
        <PrimaryButton onPress={onStart}>Get started</PrimaryButton>
        <SecondaryButton onPress={onLogin}>I already have an account</SecondaryButton>
        <TouchableOpacity onPress={onHelp} style={styles.guideLink}>
          <Text style={styles.guideLinkText}>How does Amigo work?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AuthScreen({ mode, onModeChange, onContinue, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canContinue = email.trim().length > 3 && password.trim().length >= 8 && (mode === "login" || name.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Header title={mode === "login" ? "Welcome back" : "Create your account"} onBack={onBack} />
        <View style={styles.formBody}>
          <Text style={styles.formIntro}>
            {mode === "login" ? "Let’s find the right help for you." : "Amigo keeps finding local help simple."}
          </Text>
          {mode === "register" ? (
            <TextInput
              autoCapitalize="words"
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.softInk}
              style={styles.input}
              value={name}
            />
          ) : null}
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor={COLORS.softInk}
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password (8 or more characters)"
            placeholderTextColor={COLORS.softInk}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Text style={styles.demoNote}>Phase 4 demo mode: backend connection will be added in Phase 5.</Text>
          <PrimaryButton disabled={!canContinue} onPress={onContinue}>
            Continue
          </PrimaryButton>
          <TouchableOpacity onPress={() => onModeChange(mode === "login" ? "register" : "login")} style={styles.switchLink}>
            <Text style={styles.switchLinkText}>
              {mode === "login" ? "New to Amigo? Create an account" : "Already have an account? Log in"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ onSearch, onBookings, onHelp }) {
  const [message, setMessage] = useState("");
  const suggestions = ["An electrician in Johar", "A plumber in Gulshan", "A tutor near DHA"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenFlex}>
        <ScrollView contentContainerStyle={styles.screenContent}>
          <Header title="Hello, Amigo" subtitle="What can we help you with?" onHelp={onHelp} />
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Find local help</Text>
            <Text style={styles.heroTitle}>Just tell us what you need.</Text>
            <Text style={styles.heroText}>English, Urdu, or Roman Urdu — write naturally.</Text>
          </View>
          <TextInput
            multiline
            onChangeText={setMessage}
            placeholder="e.g. Mujhe Johar mein electrician chahiye"
            placeholderTextColor={COLORS.softInk}
            style={[styles.requestInput, styles.input]}
            value={message}
          />
          <PrimaryButton disabled={!message.trim()} onPress={() => onSearch(message.trim())}>
            Find help
          </PrimaryButton>
          <Text style={styles.sectionLabel}>Try asking for...</Text>
          {suggestions.map((suggestion) => (
            <TouchableOpacity key={suggestion} onPress={() => setMessage(suggestion)} style={styles.suggestionRow}>
              <View style={styles.suggestionIcon}>
                <Text style={styles.suggestionIconText}>✦</Text>
              </View>
              <Text style={styles.suggestionText}>{suggestion}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <BottomNav active="home" onHome={() => {}} onBookings={onBookings} onHelp={onHelp} />
      </View>
    </SafeAreaView>
  );
}

function ProviderCard({ provider, onSelect }) {
  return (
    <TouchableOpacity onPress={onSelect} style={styles.providerCard}>
      <View style={styles.providerAvatar}>
        <Text style={styles.providerAvatarText}>{provider.initials}</Text>
      </View>
      <View style={styles.providerDetails}>
        <View style={styles.providerNameRow}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.rating}>★ {provider.rating}</Text>
        </View>
        <Text style={styles.providerMeta}>{provider.category} · {provider.zone}</Text>
        <Text style={styles.providerDescription}>{provider.description}</Text>
        <Text style={styles.viewProvider}>View provider ›</Text>
      </View>
    </TouchableOpacity>
  );
}

function ResultsScreen({ message, providers, onSelect, onBack, onHelp }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenFlex}>
        <ScrollView contentContainerStyle={styles.screenContent}>
          <Header title="Your matches" subtitle="Simple, trusted options" onBack={onBack} onHelp={onHelp} />
          <View style={styles.requestSummary}>
            <Text style={styles.summaryLabel}>You asked for</Text>
            <Text style={styles.summaryText}>{message}</Text>
          </View>
          <Text style={styles.resultsTitle}>{providers.length} providers found</Text>
          <Text style={styles.resultsSubtitle}>Sorted by rating to help you choose with confidence.</Text>
          {providers.length ? providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onSelect={() => onSelect(provider)} />
          )) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyText}>Try adding a service type and neighborhood to your request.</Text>
            </View>
          )}
        </ScrollView>
        <BottomNav active="home" onHome={onBack} onBookings={() => {}} onHelp={onHelp} />
      </View>
    </SafeAreaView>
  );
}

function BookingScreen({ provider, onConfirm, onBack }) {
  const [date, setDate] = useState("10 Aug 2026");
  const [time, setTime] = useState("2:30 PM");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Header title="Confirm your booking" subtitle="You’re almost there" onBack={onBack} />
        <View style={styles.selectedProvider}>
          <View style={styles.providerAvatarLarge}>
            <Text style={styles.providerAvatarText}>{provider.initials}</Text>
          </View>
          <View>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerMeta}>{provider.category} · {provider.zone}</Text>
            <Text style={styles.rating}>★ {provider.rating} rating</Text>
          </View>
        </View>
        <Text style={styles.sectionLabel}>When would you like help?</Text>
        <TextInput onChangeText={setDate} style={styles.input} value={date} />
        <TextInput onChangeText={setTime} style={styles.input} value={time} />
        <View style={styles.confirmNote}>
          <Text style={styles.confirmNoteIcon}>✓</Text>
          <Text style={styles.confirmNoteText}>Your request will be saved as pending until confirmed.</Text>
        </View>
        <PrimaryButton onPress={() => onConfirm({ date, time })}>Confirm booking</PrimaryButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingsScreen({ bookings, onHome, onHelp }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenFlex}>
        <ScrollView contentContainerStyle={styles.screenContent}>
          <Header title="My bookings" subtitle="Everything in one place" onHelp={onHelp} />
          {bookings.length ? bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingTopRow}>
                <Text style={styles.providerName}>{booking.provider}</Text>
                <Text style={styles.statusPill}>{booking.status}</Text>
              </View>
              <Text style={styles.providerMeta}>{booking.category} · {booking.zone}</Text>
              <Text style={styles.bookingTime}>◷ {booking.date} at {booking.time}</Text>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyText}>Your confirmed requests will appear here.</Text>
              <PrimaryButton onPress={onHome}>Find a service</PrimaryButton>
            </View>
          )}
        </ScrollView>
        <BottomNav active="bookings" onHome={onHome} onBookings={() => {}} onHelp={onHelp} />
      </View>
    </SafeAreaView>
  );
}

function GuideScreen({ onBack }) {
  const steps = [
    ["1", "Tell Amigo what you need", "Write naturally in English, Urdu, or Roman Urdu."],
    ["2", "Choose a provider", "We show local matches and their ratings so you can choose comfortably."],
    ["3", "Pick a time and book", "Review the details, then confirm your request."],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Header title="How Amigo works" subtitle="A little guide for your first visit" onBack={onBack} />
        <View style={styles.guideIntro}>
          <Text style={styles.guideIntroMark}>A</Text>
          <Text style={styles.guideIntroTitle}>Help should feel easy.</Text>
          <Text style={styles.guideIntroText}>Amigo turns a simple message into a clear next step.</Text>
        </View>
        {steps.map(([number, title, text]) => (
          <View key={number} style={styles.guideStep}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>{title}</Text>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          </View>
        ))}
        <View style={styles.guideTip}>
          <Text style={styles.guideTipTitle}>A small tip</Text>
          <Text style={styles.guideTipText}>Mention your area and when you need help for the best matches.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [guideReturnScreen, setGuideReturnScreen] = useState("welcome");
  const [authMode, setAuthMode] = useState("login");
  const [requestMessage, setRequestMessage] = useState("");
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookings, setBookings] = useState([]);

  const searchProviders = (message) => {
    const lower = message.toLowerCase();
    const category = lower.includes("plumb") ? "Plumber" : "Electrician";
    const results = MOCK_PROVIDERS.filter((provider) => provider.category === category);
    setRequestMessage(message);
    setProviders(results);
    setScreen("results");
  };

  const confirmBooking = ({ date, time }) => {
    setBookings((current) => [
      {
        id: Date.now(),
        provider: selectedProvider.name,
        category: selectedProvider.category,
        zone: selectedProvider.zone,
        date,
        time,
        status: "Pending",
      },
      ...current,
    ]);
    setSelectedProvider(null);
    setScreen("bookings");
    Alert.alert("Booking saved", "Your request is now pending confirmation.");
  };

  const openGuide = () => {
    setGuideReturnScreen(screen);
    setScreen("guide");
  };

  const content = useMemo(() => {
    if (screen === "welcome") {
      return <WelcomeScreen onStart={() => { setAuthMode("register"); setScreen("auth"); }} onLogin={() => { setAuthMode("login"); setScreen("auth"); }} onHelp={openGuide} />;
    }
    if (screen === "auth") {
      return <AuthScreen mode={authMode} onModeChange={setAuthMode} onContinue={() => setScreen("home")} onBack={() => setScreen("welcome")} />;
    }
    if (screen === "home") {
      return <HomeScreen onSearch={searchProviders} onBookings={() => setScreen("bookings")} onHelp={openGuide} />;
    }
    if (screen === "results") {
      return <ResultsScreen message={requestMessage} providers={providers} onSelect={(provider) => { setSelectedProvider(provider); setScreen("booking"); }} onBack={() => setScreen("home")} onHelp={openGuide} />;
    }
    if (screen === "booking") {
      return <BookingScreen provider={selectedProvider} onConfirm={confirmBooking} onBack={() => setScreen("results")} />;
    }
    if (screen === "bookings") {
      return <BookingsScreen bookings={bookings} onHome={() => setScreen("home")} onHelp={openGuide} />;
    }
    return <GuideScreen onBack={() => setScreen(guideReturnScreen)} />;
  }, [authMode, bookings, guideReturnScreen, providers, requestMessage, screen, selectedProvider]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bone} />
      {content}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bone },
  screenFlex: { flex: 1 },
  welcomeContainer: { flexGrow: 1, justifyContent: "center", padding: 28 },
  welcomeArt: { alignSelf: "center", height: 210, justifyContent: "center", marginBottom: 20, width: 220 },
  sunCircle: { backgroundColor: COLORS.cottonRose, borderRadius: 90, height: 180, left: 20, position: "absolute", top: 14, width: 180 },
  artCard: { alignItems: "center", backgroundColor: COLORS.mutedTeal, borderRadius: 28, elevation: 4, height: 130, justifyContent: "center", shadowColor: COLORS.blueSlate, shadowOpacity: 0.15, shadowRadius: 10, transform: [{ rotate: "-6deg" }], width: 150 },
  artEmoji: { color: COLORS.white, fontSize: 72, fontWeight: "700" },
  artBadge: { alignItems: "center", backgroundColor: COLORS.drySage, borderColor: COLORS.white, borderRadius: 28, borderWidth: 5, bottom: 18, height: 58, justifyContent: "center", position: "absolute", right: 14, width: 58 },
  artBadgeText: { color: COLORS.blueSlate, fontSize: 26 },
  logo: { color: COLORS.blueSlate, fontSize: 40, fontWeight: "800", letterSpacing: -1, textAlign: "center" },
  welcomeTitle: { color: COLORS.ink, fontSize: 27, fontWeight: "800", lineHeight: 34, marginTop: 12, textAlign: "center" },
  welcomeText: { color: COLORS.softInk, fontSize: 16, lineHeight: 24, marginBottom: 28, marginTop: 14, textAlign: "center" },
  primaryButton: { alignItems: "center", backgroundColor: COLORS.mutedTeal, borderRadius: 16, minHeight: 54, justifyContent: "center", marginTop: 12, paddingHorizontal: 20 },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  disabledButton: { backgroundColor: "#AAB6A9" },
  secondaryButton: { alignItems: "center", borderColor: COLORS.blueSlate, borderRadius: 16, borderWidth: 1.5, minHeight: 54, justifyContent: "center", marginTop: 12, paddingHorizontal: 20 },
  secondaryButtonText: { color: COLORS.blueSlate, fontSize: 15, fontWeight: "700" },
  guideLink: { alignSelf: "center", marginTop: 22, padding: 8 },
  guideLinkText: { color: COLORS.blueSlate, fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  header: { paddingBottom: 18, paddingHorizontal: 22, paddingTop: 16 },
  headerRow: { alignItems: "center", flexDirection: "row" },
  brandMarkSmall: { alignItems: "center", backgroundColor: COLORS.mutedTeal, borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  brandMarkText: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  backButton: { alignItems: "center", backgroundColor: COLORS.white, borderRadius: 15, height: 42, justifyContent: "center", marginRight: 12, width: 42 },
  backIcon: { color: COLORS.blueSlate, fontSize: 34, lineHeight: 36 },
  headerCopy: { flex: 1 },
  headerTitle: { color: COLORS.ink, fontSize: 23, fontWeight: "800" },
  headerSubtitle: { color: COLORS.softInk, fontSize: 13, marginTop: 3 },
  helpButton: { alignItems: "center", backgroundColor: COLORS.drySage, borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  helpButtonText: { color: COLORS.blueSlate, fontSize: 19, fontWeight: "800" },
  formContainer: { flexGrow: 1 },
  formBody: { padding: 22 },
  formIntro: { color: COLORS.softInk, fontSize: 16, lineHeight: 23, marginBottom: 20 },
  input: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 15, borderWidth: 1, color: COLORS.ink, fontSize: 16, minHeight: 54, marginTop: 12, paddingHorizontal: 16 },
  demoNote: { color: COLORS.softInk, fontSize: 12, lineHeight: 18, marginTop: 14 },
  switchLink: { alignSelf: "center", marginTop: 22, padding: 8 },
  switchLinkText: { color: COLORS.blueSlate, fontSize: 14, fontWeight: "700" },
  screenContent: { paddingBottom: 28 },
  heroCard: { backgroundColor: COLORS.mutedTeal, borderRadius: 24, marginHorizontal: 22, padding: 22 },
  heroEyebrow: { color: COLORS.drySage, fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  heroTitle: { color: COLORS.white, fontSize: 27, fontWeight: "800", lineHeight: 32, marginTop: 7 },
  heroText: { color: "#EAF0E7", fontSize: 14, lineHeight: 20, marginTop: 10 },
  requestInput: { minHeight: 120, paddingTop: 16, textAlignVertical: "top" },
  sectionLabel: { color: COLORS.ink, fontSize: 16, fontWeight: "800", marginHorizontal: 22, marginTop: 28 },
  suggestionRow: { alignItems: "center", backgroundColor: COLORS.white, borderRadius: 15, flexDirection: "row", marginHorizontal: 22, marginTop: 10, minHeight: 58, paddingHorizontal: 14 },
  suggestionIcon: { alignItems: "center", backgroundColor: COLORS.cottonRose, borderRadius: 12, height: 34, justifyContent: "center", width: 34 },
  suggestionIconText: { color: COLORS.blueSlate, fontSize: 17 },
  suggestionText: { color: COLORS.ink, flex: 1, fontSize: 14, marginLeft: 12 },
  chevron: { color: COLORS.blueSlate, fontSize: 24 },
  bottomNav: { alignItems: "center", backgroundColor: COLORS.white, borderTopColor: COLORS.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-around", minHeight: 72, paddingBottom: 8, paddingTop: 8 },
  navItem: { alignItems: "center", minWidth: 70 },
  navIcon: { color: COLORS.softInk, fontSize: 22 },
  navLabel: { color: COLORS.softInk, fontSize: 11, fontWeight: "700", marginTop: 2 },
  activeNavText: { color: COLORS.mutedTeal },
  requestSummary: { backgroundColor: COLORS.cottonRose, borderRadius: 18, marginHorizontal: 22, padding: 17 },
  summaryLabel: { color: COLORS.blueSlate, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  summaryText: { color: COLORS.ink, fontSize: 16, fontWeight: "700", lineHeight: 23, marginTop: 5 },
  resultsTitle: { color: COLORS.ink, fontSize: 22, fontWeight: "800", marginHorizontal: 22, marginTop: 25 },
  resultsSubtitle: { color: COLORS.softInk, fontSize: 14, marginHorizontal: 22, marginTop: 5 },
  providerCard: { backgroundColor: COLORS.white, borderRadius: 19, flexDirection: "row", marginHorizontal: 22, marginTop: 14, padding: 15 },
  providerAvatar: { alignItems: "center", backgroundColor: COLORS.drySage, borderRadius: 19, height: 58, justifyContent: "center", width: 58 },
  providerAvatarLarge: { alignItems: "center", backgroundColor: COLORS.drySage, borderRadius: 26, height: 78, justifyContent: "center", marginRight: 15, width: 78 },
  providerAvatarText: { color: COLORS.blueSlate, fontSize: 17, fontWeight: "800" },
  providerDetails: { flex: 1, marginLeft: 13 },
  providerNameRow: { alignItems: "flex-start", flexDirection: "row" },
  providerName: { color: COLORS.ink, flex: 1, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  rating: { color: COLORS.success, fontSize: 13, fontWeight: "800" },
  providerMeta: { color: COLORS.softInk, fontSize: 13, marginTop: 4 },
  providerDescription: { color: COLORS.softInk, fontSize: 13, lineHeight: 19, marginTop: 8 },
  viewProvider: { color: COLORS.blueSlate, fontSize: 13, fontWeight: "800", marginTop: 10 },
  emptyCard: { alignItems: "center", backgroundColor: COLORS.white, borderRadius: 19, margin: 22, padding: 25 },
  emptyTitle: { color: COLORS.ink, fontSize: 18, fontWeight: "800" },
  emptyText: { color: COLORS.softInk, fontSize: 14, lineHeight: 21, marginBottom: 8, marginTop: 8, textAlign: "center" },
  selectedProvider: { alignItems: "center", backgroundColor: COLORS.white, borderRadius: 20, flexDirection: "row", marginHorizontal: 22, padding: 17 },
  confirmNote: { alignItems: "center", backgroundColor: "#E7EFE6", borderRadius: 15, flexDirection: "row", marginHorizontal: 22, marginTop: 22, padding: 14 },
  confirmNoteIcon: { color: COLORS.success, fontSize: 20, fontWeight: "800", marginRight: 10 },
  confirmNoteText: { color: COLORS.success, flex: 1, fontSize: 13, lineHeight: 19 },
  bookingCard: { backgroundColor: COLORS.white, borderRadius: 19, marginHorizontal: 22, marginTop: 14, padding: 17 },
  bookingTopRow: { alignItems: "center", flexDirection: "row" },
  statusPill: { backgroundColor: COLORS.drySage, borderRadius: 10, color: COLORS.blueSlate, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, textTransform: "uppercase" },
  bookingTime: { color: COLORS.blueSlate, fontSize: 14, fontWeight: "700", marginTop: 14 },
  guideIntro: { alignItems: "center", backgroundColor: COLORS.mutedTeal, borderRadius: 23, marginHorizontal: 22, padding: 24 },
  guideIntroMark: { alignItems: "center", backgroundColor: COLORS.cottonRose, borderRadius: 24, color: COLORS.blueSlate, fontSize: 25, fontWeight: "800", height: 48, lineHeight: 48, textAlign: "center", width: 48 },
  guideIntroTitle: { color: COLORS.white, fontSize: 23, fontWeight: "800", marginTop: 14 },
  guideIntroText: { color: "#EAF0E7", fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: "center" },
  guideStep: { alignItems: "flex-start", flexDirection: "row", marginHorizontal: 22, marginTop: 22 },
  stepNumber: { alignItems: "center", backgroundColor: COLORS.drySage, borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  stepNumberText: { color: COLORS.blueSlate, fontSize: 15, fontWeight: "800" },
  stepCopy: { flex: 1, marginLeft: 13 },
  stepTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "800" },
  stepText: { color: COLORS.softInk, fontSize: 14, lineHeight: 21, marginTop: 4 },
  guideTip: { backgroundColor: COLORS.cottonRose, borderRadius: 17, margin: 22, padding: 17 },
  guideTipTitle: { color: COLORS.blueSlate, fontSize: 14, fontWeight: "800" },
  guideTipText: { color: COLORS.ink, fontSize: 14, lineHeight: 20, marginTop: 5 },
});
