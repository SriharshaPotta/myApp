import { Button, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useWarmUpBrowser } from 'hooks/useWarmUpBrowser';
import { defaultStyles } from 'constants/styles';
import Colors from 'constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useOAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { Link } from 'expo-router';
import Spinner from "react-native-loading-spinner-overlay";
import { useSignUp } from "@clerk/clerk-expo";

enum Strategy{
  Google = 'oauth_google',
  Apple = 'oauth_apple',
  Facebook = 'oauth_facebook',
}

const Page = () => {

  const router = useRouter();

  const [formattedNumber, setFormattedNumber] = useState('');

  const handleTextChange = (input: string) => {
    // Remove non-numeric characters
    const numericInput = input.replace(/[^0-9]/g, '');

    // Add spaces after each digit
    const formattedInput = numericInput
      .slice(0, 6) // Limit to 6 digits
      .split('')
      .map((char, index) => (index === 5 ? char : char + ' '))
      .join('');

    setFormattedNumber(formattedInput);
}
  
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });
  const { startOAuthFlow: facebookAuth } = useOAuth({ strategy: 'oauth_facebook' });

  const [showPassword, setShowPassword] = useState(false);

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
      [Strategy.Facebook]: facebookAuth,
    }[strategy];

    try {
      const { createdSessionId, setActive } = await selectedAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.push('/(modals)/onboarding');
      }
    } catch (err) {
      console.error('OAuth error ', err);
    }
  };

    const { isLoaded, signUp, setActive } = useSignUp();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    // Create the user and send the verification email
    const onSignUpPress = async () => {
      if (!isLoaded) {
        return;
      }
      setLoading(true);

      try {
        // Create the user on Clerk
        await signUp.create({
          emailAddress,
          password,
        });

        // Send verification Email
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // change the UI to verify the email address
        setPendingVerification(true);
      } catch (err: any) {
        alert(err.errors[0].message);
      } finally {
        setLoading(false);
      }
    };

    // Verify the email address
    const onPressVerify = async () => {
      if (!isLoaded) {
        return;
      }
      setLoading(true);

      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code,
        });

        await setActive({ session: completeSignUp.createdSessionId });
      } catch (err: any) {
        alert(err.errors[0].message);
      } finally {
        setLoading(false);
        router.push("/(modals)/onboarding");
      }
    };





  return (
    <ScrollView>
      <View style={styles.container}>
        <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
        <Spinner visible={loading} />
        <View>
          <Image source={require("./appLogo.png")} style={styles.image} />
          <Text style={styles.headtext}>Sign Up</Text>
        </View>
        {!pendingVerification && (
          <>
            <TextInput
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor="#A9A9A9"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={[defaultStyles.inputField, { marginBottom: 30 }]}
            />
            <View style={styles.passwordInputContainer}>
              <TextInput
                autoCapitalize="none"
                placeholder="Password"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              {/* Eye icon to toggle password visibility */}
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ?"eye-off-outline" : "eye-outline"}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={defaultStyles.btn}>
              <TouchableOpacity
                onPress={pendingVerification ? onPressVerify : onSignUpPress} // we dont have that in login
                style={defaultStyles.btn}
              >
                <Text style={defaultStyles.btnText}>
                  {pendingVerification ? "Verify Email" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>

          </>
        )}

        {pendingVerification && (
          <>
            <View>
              <TextInput
                placeholder="000000"
                keyboardType="numeric"
                maxLength={7}
                value={code}
                style={[defaultStyles.inputField, { marginBottom: 30 }]}
                onChangeText={setCode}
              />
            </View>
            <TouchableOpacity style={styles.btnOutline}>
              <Link href="/(modals)/onboarding">
                <Text style={styles.btnOutlineText} onPress={onPressVerify}>
                  {" "}
                  Verify Email{" "}
                </Text>
              </Link>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.seperatorView}>
          <View
            style={{
              flex: 1,
              borderBottomColor: "#000",
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <Text style={styles.seperator}>or</Text>
          <View
            style={{
              flex: 1,
              borderBottomColor: "#000",
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
        </View>
        <View style={{ gap: 20 }}>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth(Strategy.Apple)}
          >
            <Ionicons
              name="logo-apple"
              size={24}
              style={defaultStyles.btnIcon}
            />
            <Text style={styles.btnOutlineText}>Continue with Apple</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth(Strategy.Google)}
          >
            <Ionicons
              name="logo-google"
              size={24}
              style={defaultStyles.btnIcon}
            />
            <Text style={styles.btnOutlineText}>Continue with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => onSelectAuth(Strategy.Facebook)}
          >
            <Ionicons
              name="logo-facebook"
              size={24}
              style={defaultStyles.btnIcon}
            />
            <Text style={styles.btnOutlineText}>Continue with Facebook</Text>
          </TouchableOpacity>
          <View style={styles.seperatorView}>
            <View
              style={{
                flex: 1,
                borderBottomColor: "#000",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <Text style={styles.seperator}>or</Text>
            <View
              style={{
                flex: 1,
                borderBottomColor: "#000",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
          </View>
          <TouchableOpacity style={styles.btnOutline}>
            <Link href="./login">
              <Text style={styles.btnOutlineText}> Return to Log In </Text>
            </Link>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 26,
  },
  seperatorView: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  seperator: {
    fontFamily: "mon-sb",
    color: Colors.grey,
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.grey,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "mon-sb",
  },
  btn: {
    backgroundColor: "#FF385C",
    borderWidth: 0,
    borderColor: '#ffffff',
    height: 50,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  image: {
    alignContent: "center",
    resizeMode: "contain",
    width: 360,
    height: 200,
    marginTop: -30,
  },
  headtext: {
    fontFamily: "mon-b",
    fontSize: 25,
    textAlign: "center",
    marginTop: -30,
    marginBottom: 35,
  },
  togglePasswordText: {
    color: Colors.primary, // Change the color to your preference
    fontSize: 16,
    fontFamily: "mon-sb",
    marginTop: 10,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderColor: "#ABABAB",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 30,
    overflow: "hidden", 
  },
  passwordInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "black",
    padding: 10,
  },
  eyeIconContainer: {
    padding: 10,
    borderLeftWidth: 1,
    borderColor: "white",
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: "#6c47ff",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});  

export default Page