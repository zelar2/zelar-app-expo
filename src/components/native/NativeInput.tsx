import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function NativeInput({
  label,
  error,
  ...props
}: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && styles.multiline,
          error && styles.inputError,
        ]}
        placeholderTextColor="#999999"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D9DEE7",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    color: "#333333",
    fontSize: 14,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#EB5757",
  },
  error: {
    color: "#EB5757",
    fontSize: 12,
  },
});
