import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, ChevronRight, Clock, MapPin, Search, Stethoscope, UserCog, Video } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { supabase } from "../../src/lib/supabase";
import { CATEGORY_ORDER, categoryLabel, councilLabel, formatCents, initials, shortTime, WEEKDAYS } from "../../src/lib/profissionais";

