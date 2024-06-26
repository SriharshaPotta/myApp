import React, { useEffect, useRef, useState, forwardRef } from "react";
import { View, Text, Button, ScrollView, StyleSheet, Modal, TextInput, TouchableOpacity, SafeAreaView, Animated, Image } from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot } from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebaseConfig";
import { useAuth, useUser } from "@clerk/clerk-expo";
import Colors from "constants/Colors";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Video } from "expo-av";
import { jsPDF } from "jspdf";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();

const Portfolio = () => {

  let achievementsachievementIDs = new Array();

  const { signOut, isSignedIn } = useAuth();
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [email, setEmail] = useState(user?.emailAddresses[0].emailAddress);



  let generatePdf = async () => {
    // Create the HTML content using user data
    const achievementsHtml = achievements.map(
      (achievement) =>
        `<p><strong>${achievement.title}</strong>: ${
          achievement.description
        }</p>`
    );
    const athleticsHtml = athletics.map(
      (athletic) =>
        `<p><strong>${athletic.title}</strong>: ${athletic.description}</p>`
    );
    const artsHtml = arts.map(
      (art) =>
        `<p><strong>${art.title}</strong>: ${art.description}</p>`
    );
    const clubsHtml = clubs.map(
      (club) =>
        `<p><strong>${club.title}</strong>: ${club.description}</p>`
    );
    const servicesHtml = services.map(
      (service) =>
        `<p><strong>${service.title}</strong>: ${service.description}</p>`
    );
    const honorsHtml = honors.map(
      (honor) =>
        `<p><strong>${honor.title}</strong>: ${honor.description}</p>`
    );
  
    const html = `
      <html>
        <body>
        <img src="${user?.profileImageUrl}" width="75" height="75">
          <h1 style="text-align:center;"><b>${user?.fullName}</b></h1>
          <p style="text-align:center;">${user?.emailAddresses}</p>
          <p style="text-align:center;">${user?.phoneNumbers}</p>
          
          <h2>Academic Achievements</h2>
          ${achievementsHtml.join("")}
          <hr>

          <h2>Athletic Participation</h2>
          ${athleticsHtml.join("")}
          <hr>

          <h2>Performing Arts Experience</h2>
          ${artsHtml.join("")}
          <hr>

          <h2>Clubs And Organization Memberships</h2>
          ${clubsHtml.join("")}
          <hr>

          <h2>Community Service Hours</h2>
          ${servicesHtml.join("")}
          <hr>

          <h2>Honors Classes</h2>
          ${honorsHtml.join("")}
        </body>
      </html>
    `;
  
  const file = await printToFileAsync({
      html: html,
      base64: false,
    });
    await shareAsync(file.uri);
  };

  const swipeableRef = useRef(null);

  const [achievements, setAchievements] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);
  const [athletics, setAthletics] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);
  const [arts, setArts] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);
  const [clubs, setClubs] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);
  const [services, setServices] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);
  const [honors, setHonors] = useState<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>([]);

  const [isAddAchievementModalVisible, setAddAchievementModalVisible] = useState(false);
  const [isAddAthleticModalVisible, setAddAthleticModalVisible] = useState(false);
  const [isAddArtModalVisible, setAddArtModalVisible] = useState(false);
  const [isAddClubModalVisible, setAddClubModalVisible] = useState(false);
  const [isAddServiceModalVisible, setAddServiceModalVisible] = useState(false);
  const [isAddHonorModalVisible, setAddHonorModalVisible] = useState(false);

  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    image: [],
  });
  const [newAthletic, setNewAthletic] = useState({
    title: "",
    description: "",
    image: [],
  });
  const [newArt, setNewArt] = useState({
    title: "",
    description: "",
    image: [],
  });
  const [newClub, setNewClub] = useState({
    title: "",
    description: "",
    image: [],
  });
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    image: [],
  });
  const [newHonor, setNewHonor] = useState({
    title: "",
    description: "",
    image: [],
  });

  const toggleAddAchievementModal = () => {
    setAddAchievementModalVisible(!isAddAchievementModalVisible);
  };
  const toggleAddAthleticModal = () => {
    setAddAthleticModalVisible(!isAddAthleticModalVisible);
  };
  const toggleAddArtModal = () => {
    setAddArtModalVisible(!isAddArtModalVisible);
  };
  const toggleAddClubModal = () => {
    setAddClubModalVisible(!isAddClubModalVisible);
  };
  const toggleAddServiceModal = () => {
    setAddServiceModalVisible(!isAddServiceModalVisible);
  };
  const toggleAddHonorModal = () => {
    setAddHonorModalVisible(!isAddHonorModalVisible);
  };

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      // Fetch portfolio data from Firestore using userDocRef
      const userAchievementsRef = collection(userDocRef, "achievements");
      const userAthleticsRef = collection(userDocRef, "athletics");
      const userArtsRef = collection(userDocRef, "arts");
      const userClubsRef = collection(userDocRef, "clubs");
      const userServicesRef = collection(userDocRef, "services");
      const userHonorsRef = collection(userDocRef, "honors");

      const [achievementsSnapshot, athleticsSnapshot, artsSnapshot, clubsSnapshot, servicesSnapshot, honorsSnapshot,] =
        await Promise.all([
          getDocs(userAchievementsRef),
          getDocs(userAthleticsRef),
          getDocs(userArtsRef),
          getDocs(userClubsRef),
          getDocs(userServicesRef),
          getDocs(userHonorsRef),
        ]);

      const achievementsData = achievementsSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );
      const athleticsData = athleticsSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );
      const artsData = artsSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );
      const clubsData = clubsSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );
      const servicesData = servicesSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );
      const honorsData = honorsSnapshot.docs.map(
        (doc: { id: any; data: () => any }) => ({ id: doc.id, ...doc.data() })
      );

      // Update state with fetched data
      setAchievements(achievementsData);
      setAthletics(athleticsData);
      setArts(artsData);
      setClubs(clubsData);
      setServices(servicesData);
      setHonors(honorsData);
    };

    if (isSignedIn) {
      fetchPortfolioData();
    }
  }, [isSignedIn]); // Add dependencies as needed

  // ADD
  const userCollection = collection(FIRESTORE_DB, "users");
  const userDocRef = doc(userCollection, user?.id);

  const [images, setImages] = useState<string[]>([]); // Declare type as an array of strings

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Function to handle image selection
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri; // Using assets array to access selected image
      setImages([...images, selectedImage]);
    }
  };
  const addAchievement = async () => {
    if (newAchievement.title && newAchievement.description) {
      const achievementData = {
        title: newAchievement.title,
        description: newAchievement.description,
        image: images,
      };
      const achievementDocRef = await addDoc(
        collection(userDocRef, "achievements"),
        achievementData
      );
      const firebaseId = achievementDocRef.id;

      setAchievements([
        ...achievements,
        { id: achievements.length + 1, firebaseId, ...achievementData },
      ]);
      setNewAchievement({ title: "", description: "", image: []});
      setImages([]);
      toggleAddAchievementModal();
    }
  };

  const addAthletic = async () => {
    if (newAthletic.title && newAthletic.description) {
      const athleticData = {
        title: newAthletic.title,
        description: newAthletic.description,
        image: images,
      };
      const athleticDocRef = await addDoc(
        collection(userDocRef, "athletics"),
        athleticData
      );
      const firebaseId = athleticDocRef.id;

      setAthletics([
        ...athletics,
        { id: athletics.length + 1, firebaseId, ...athleticData },
      ]);
      setNewAthletic({ title: "", description: "", image: []});
      setImages([]);
      toggleAddAthleticModal();
    }
  };
  const addArt = async () => {
    if (newArt.title && newArt.description) {
      const artData = {
        title: newArt.title,
        description: newArt.description,
        image: images,
      };
      const artDocRef = await addDoc(collection(userDocRef, "arts"), artData);
      const firebaseId = artDocRef.id;

      setArts([...arts, { id: arts.length + 1, firebaseId, ...artData }]);
      setNewArt({ title: "", description: "", image: []});
      setImages([]);
      toggleAddArtModal();
    }
  };
  const addClub = async () => {
    if (newClub.title && newClub.description) {
      const clubData = {
        title: newClub.title,
        description: newClub.description,
        image: images,
      };
      const clubDocRef = await addDoc(
        collection(userDocRef, "clubs"),
        clubData
      );
      const firebaseId = clubDocRef.id;

      setClubs([...clubs, { id: clubs.length + 1, firebaseId, ...clubData }]);
      setNewClub({ title: "", description: "", image: []});
      setImages([]);
      toggleAddClubModal();
    }
  };
  const addService = async () => {
    if (newService.title && newService.description) {
      const serviceData = {
        title: newService.title,
        description: newService.description,
        image: images,
      };
      const serviceDocRef = await addDoc(
        collection(userDocRef, "services"),
        serviceData
      );
      const firebaseId = serviceDocRef.id;

      setServices([
        ...services,
        { id: services.length + 1, firebaseId, ...serviceData },
      ]);
      setNewService({ title: "", description: "", image: []});
      setImages([]);
      toggleAddServiceModal();
    }
  };
  const addHonor = async () => {
    if (newHonor.title && newHonor.description) {
      const honorData = {
        title: newHonor.title,
        description: newHonor.description,
        image: images,
      };
      const honorDocRef = await addDoc(
        collection(userDocRef, "honors"),
        honorData
      );
      const firebaseId = honorDocRef.id;

      setHonors([
        ...honors,
        { id: honors.length + 1, firebaseId, ...honorData },
      ]);
      setNewHonor({ title: "", description: "", image: []});
      setImages([]);
      toggleAddHonorModal();
    }
  };

  const deleteAchievement = async (localId: number, firebaseId: string) => {
    const updatedAchievements = achievements.filter(
      (achievement) => achievement.id !== localId
    );
    setAchievements(updatedAchievements);
    const achievementDocRef = doc(
      collection(userDocRef, "achievements"), firebaseId);
    await deleteDoc(achievementDocRef);
  };
  const deleteAthletic = async (localId: number, firebaseId: string) => {
    const updatedAthletics = athletics.filter(
      (athletic) => athletic.id !== localId
    );
    setAthletics(updatedAthletics);
    const athleticDocRef = doc(collection(userDocRef, "athletics"), firebaseId);
    await deleteDoc(athleticDocRef);
  };
  const deleteArt = async (localId: number, firebaseId: string) => {
    const updatedArts = arts.filter((art) => art.id !== localId);
    setArts(updatedArts);
    const artDocRef = doc(collection(userDocRef, "arts"), firebaseId);
    await deleteDoc(artDocRef);
  };
  const deleteClub = async (localId: number, firebaseId: string) => {
    const updatedClubs = clubs.filter((club) => club.id !== localId);
    setClubs(updatedClubs);
    const clubDocRef = doc(collection(userDocRef, "clubs"), firebaseId);
    await deleteDoc(clubDocRef);
  };
  const deleteService = async (localId: number, firebaseId: string) => {
    const updatedServices = services.filter(
      (service) => service.id !== localId
    );
    setServices(updatedServices);
    const serviceDocRef = doc(collection(userDocRef, "services"), firebaseId);
    await deleteDoc(serviceDocRef);
  };
  const deleteHonor = async (localId: number, firebaseId: string) => {
    const updatedHonors = honors.filter((honor) => honor.id !== localId);
    setHonors(updatedHonors);
    const honorDocRef = doc(collection(userDocRef, "honors"), firebaseId);
    await deleteDoc(honorDocRef);
  };

  // RENDER
  const renderAchievements = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() =>
            deleteAchievement(
              achievements[index].id,
              achievements[index].firebaseId
            )
          }
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
  return achievements.map((achievement, index) => (
    <GestureHandlerRootView>
    <Swipeable
      key={achievement.id}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, index)
      }
    >
      <View style={styles.card}>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
          {Array.isArray(achievement.image) && achievement.image.length > 0 ? (
            achievement.image.map((imageUri, imageIndex) => (
              <Image
                key={`${index}-${imageIndex}`}
                source={{ uri: imageUri }}
                style={styles.image}
              />
            ))
          ) : (
            <Text></Text>
          )}
        </View>
      </View>
    </Swipeable>
    </GestureHandlerRootView>

  ));
  };

  const renderAthletics = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() =>
            deleteAthletic(athletics[index].id, athletics[index].firebaseId)
          }
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
    return athletics.map((athletic, index) => (
      <GestureHandlerRootView>
      <Swipeable
        key={athletic.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, index)
        }
      >
        <View style={styles.card}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{athletic.title}</Text>
            <Text style={styles.achievementDescription}>
              {athletic.description}
            </Text>
            {Array.isArray(athletic.image) &&
            athletic.image.length > 0 ? (
              athletic.image.map((imageUri, imageIndex) => (
                <Image
                  key={`${index}-${imageIndex}`}
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
      </Swipeable>
      </GestureHandlerRootView>

    ));
  };

  const renderArts = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() => deleteArt(arts[index].id, arts[index].firebaseId)}
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
    return arts.map((art, index) => (
      <GestureHandlerRootView>
      <Swipeable
        key={art.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, index)
        }
      >
        <View style={styles.card}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{art.title}</Text>
            <Text style={styles.achievementDescription}>{art.description}</Text>
            {Array.isArray(art.image) &&
            art.image.length > 0 ? (
              art.image.map((imageUri, imageIndex) => (
                <Image
                  key={`${index}-${imageIndex}`}
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
      </Swipeable>
      </GestureHandlerRootView>

    ));
  };

  const renderClubs = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() => deleteClub(clubs[index].id, clubs[index].firebaseId)}
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
    return clubs.map((club, index) => (
      <GestureHandlerRootView>

      <Swipeable
        key={club.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, index)
        }
      >
        <View style={styles.card}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{club.title}</Text>
            <Text style={styles.achievementDescription}>
              {club.description}
            </Text>
            {Array.isArray(club.image) &&
            club.image.length > 0 ? (
              club.image.map((imageUri, imageIndex) => (
                <Image
                  key={`${index}-${imageIndex}`}
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
      </Swipeable>
      </GestureHandlerRootView>

    ));
  };
  const renderServices = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() =>
            deleteService(services[index].id, services[index].firebaseId)
          }
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
    return services.map((service, index) => (
      <GestureHandlerRootView>

      <Swipeable
        key={service.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, index)
        }
      >
        <View style={styles.card}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{service.title}</Text>
            <Text style={styles.achievementDescription}>
              {service.description}
            </Text>
            {Array.isArray(service.image) &&
            service.image.length > 0 ? (
              service.image.map((imageUri, imageIndex) => (
                <Image
                  key={`${index}-${imageIndex}`}
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
      </Swipeable>
      </GestureHandlerRootView>

    ));
  };
  const renderHonors = () => {
    const renderRightActions = (
      progress: Animated.AnimatedInterpolation<string | number>,
      dragX: Animated.AnimatedInterpolation<string | number>,
      index: number
    ) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0.5, 1],
      });
      return (
        <TouchableOpacity
          onPress={() =>
            deleteHonor(honors[index].id, honors[index].firebaseId)
          }
        >
          <View style={styles.deleteButton}>
            <Animated.View
              style={{
                transform: [{ translateX: trans }],
              }}
            >
              <FontAwesome5
                name="trash-alt"
                size={20}
                color="red"
                style={styles.deleteIcon}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      );
    };
    return honors.map((honor, index) => (
      <GestureHandlerRootView>

      <Swipeable
        key={honor.id}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, index)
        }
      >
        <View style={styles.card}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementTitle}>{honor.title}</Text>
            <Text style={styles.achievementDescription}>
              {honor.description}
            </Text>
            {Array.isArray(honor.image) &&
            honor.image.length > 0 ? (
              honor.image.map((imageUri, imageIndex) => (
                <Image
                  key={`${index}-${imageIndex}`}
                  source={{ uri: imageUri }}
                  style={styles.image}
                />
              ))
            ) : (
              <Text></Text>
            )}
          </View>
        </View>
      </Swipeable>
      </GestureHandlerRootView>

    ));
  };

  return (
    // MY PORTFOLIO
  <GestureHandlerRootView>
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text
            style={styles.headerText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {firstName}'s Portfolioㅤ
            <Ionicons
              name="share-social-outline"
              color={Colors.primary}
              size={50}
              onPress={generatePdf}
            />
          </Text>
        </View>
        {/*ACADEMIC ACHIEVEMENTS*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Achievements</Text>
          {renderAchievements()}
        </View>
        {/*ACADEMIC ACHIEVEMENTS - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddAchievementModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Achievement</Text>
          </TouchableOpacity>
        </View>
        {/*ACADEMIC ACHIEVEMENTS - Adding Page*/}
        <View style={styles.centeredView}>
        <Modal visible={isAddAchievementModalVisible} transparent={true} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <Text style={styles.modalTitle}>Add Academic Achievement</Text>
              <TextInput
                style={styles.input}
                placeholder="Achievement Title"
                placeholderTextColor="#A9A9A9"
                onChangeText={(text) =>
                  setNewAchievement({ ...newAchievement, title: text })
                }
                value={newAchievement.title}
              />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Achievement Description"
                onChangeText={(text) =>
                  setNewAchievement({ ...newAchievement, description: text })
                }
                value={newAchievement.description}
                multiline
              />
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={addAchievement}
                >
                  <Text style={styles.modalButtonText}>
                    Add Academic Achievement
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={toggleAddAchievementModal}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
        </View>

        {/*ATHLETIC PARTICIPATION*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Athletic Participation</Text>
          {renderAthletics()}
        </View>
        {/*ATHLETIC PARTICIPATION - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddAthleticModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Athletic Particpation</Text>
          </TouchableOpacity>
        </View>
        {/*ATHLETIC PARTICIPATION - Adding A Page*/}
        <Modal visible={isAddAthleticModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Athletic</Text>
            <TextInput
              style={styles.input}
              placeholder="Athletics Title"
              placeholderTextColor="#A9A9A9"
              onChangeText={(text) =>
                setNewAthletic({ ...newAthletic, title: text })
              }
              value={newAthletic.title}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Athletics Description"
              onChangeText={(text) =>
                setNewAthletic({ ...newAthletic, description: text })
              }
              value={newAthletic.description}
              multiline
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={addAthletic}
              >
                <Text style={styles.modalButtonText}>Add Athletics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={toggleAddAthleticModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/*PERFORMING ARTS EXPERIENCE*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performing Arts Experience</Text>
          {renderArts()}
        </View>
        {/*PERFORMING ARTS EXPERIENCE - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddArtModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Performing Arts</Text>
          </TouchableOpacity>
        </View>
        {/*PERFORMING ARTS EXPERIENCE - Adding A Page*/}
        <Modal visible={isAddArtModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Performing Art</Text>
            <TextInput
              style={styles.input}
              placeholder="Performing Arts Title"
              placeholderTextColor="#A9A9A9"
              onChangeText={(text) => setNewArt({ ...newArt, title: text })}
              value={newArt.title}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Performing Arts Description"
              onChangeText={(text) =>
                setNewArt({ ...newArt, description: text })
              }
              value={newArt.description}
              multiline
            />
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              </TouchableOpacity>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
            ))}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addArt}>
                <Text style={styles.modalButtonText}>Add Performing Art</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={toggleAddArtModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/*CLUB AND ORGANIZATION MEMBERSHIP*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Clubs & Organization Membership
          </Text>
          {renderClubs()}
        </View>
        {/*CLUB AND ORGANIZATION MEMBERSHIP - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddClubModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Club/Organization</Text>
          </TouchableOpacity>
        </View>
        {/*CLUB AND ORGANIZATION MEMBERSHIP - Adding A Page*/}
        <Modal visible={isAddClubModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Club/Organization</Text>
            <TextInput
              style={styles.input}
              placeholder="Club/Organization Title"
              placeholderTextColor="#A9A9A9"
              onChangeText={(text) => setNewClub({ ...newClub, title: text })}
              value={newClub.title}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Club/Organization Description"
              onChangeText={(text) =>
                setNewClub({ ...newClub, description: text })
              }
              value={newClub.description}
              multiline
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addClub}>
                <Text style={styles.modalButtonText}>
                  Add Club or Organization
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={toggleAddClubModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/*COMMUNITY SERVICE HOURS*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Service Hours</Text>
          {renderServices()}
        </View>
        {/*COMMUNITY SERVICE HOURS - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddServiceModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Community Service</Text>
          </TouchableOpacity>
        </View>
        {/*COMMUNITY SERVICE HOURS - Adding A Page*/}
        <Modal visible={isAddServiceModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Community Service</Text>
            <TextInput
              style={styles.input}
              placeholder="Community Service Title"
              placeholderTextColor="#A9A9A9"
              onChangeText={(text) =>
                setNewService({ ...newService, title: text })
              }
              value={newService.title}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Community Service Description"
              onChangeText={(text) =>
                setNewService({ ...newService, description: text })
              }
              value={newService.description}
              multiline
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addService}>
                <Text style={styles.modalButtonText}>
                  Add Community Service
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={toggleAddServiceModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/*HONORS CLASSES*/}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Honors Classes</Text>
          {renderHonors()}
        </View>
        {/*HONORS CLASSES - Button*/}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddHonorModal}
          >
            <FontAwesome5
              name="plus"
              size={20}
              color="#fff"
              style={styles.addButtonIcon}
            />
            <Text style={styles.addButtonLabel}>Add Honors Class</Text>
          </TouchableOpacity>
        </View>
        {/*HONORS CLASSES - Adding A Page*/}
        <Modal visible={isAddHonorModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Honors Class</Text>
            <TextInput
              style={styles.input}
              placeholder="Honors Class Title"
              placeholderTextColor="#A9A9A9"
              onChangeText={(text) => setNewHonor({ ...newHonor, title: text })}
              value={newHonor.title}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Honors Class Description"
              onChangeText={(text) =>
                setNewHonor({ ...newHonor, description: text })
              }
              value={newHonor.description}
              multiline
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={addHonor}>
                <Text style={styles.modalButtonText}>Add Honors Class</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={toggleAddHonorModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/*GENERATE PDF - Button*/}
        <View style={styles.generatePDFButtonContainer}>
          <TouchableOpacity
            onPress={generatePdf}
            style={styles.generatePDFButton}
          >
            <Text style={styles.generatePDFButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "mon-b",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 17,
    textAlign: "center",
    fontFamily: "mon-b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 5,
    shadowOffset: {
      width: 1,
      height: 2,
    },
  },
  achievementItem: {
    fontFamily: "mon",
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "mon-sb",
  },
  achievementDescription: {
    fontFamily: "mon",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 60,
    textAlign: "center",
    fontFamily: "mon-b",
    marginTop: 50,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    height: 50,
    width: 50,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#3498db",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    marginRight: 15,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "mon-b",
  },
  input: {
    height: 50,
    borderColor: "#800080",
    borderWidth: 2,
    paddingLeft: 18,
    borderRadius: 10,
    marginBottom: 50,
    fontFamily: "mon",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 20,
    textAlignVertical: "top",
    shadowColor: "black",
    shadowRadius: 100,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.9,


  },
  multilineInput: {
    height: 400,
    textAlignVertical: "top",
    shadowColor: "black",
    shadowRadius: 100,
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.9,
  },
  addButtonContainer: {
    marginTop: 0,
    shadowColor: "#800080",
    shadowRadius: 10,

  },
  addButton: {
    backgroundColor: "#27ae60",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  addButtonIcon: {
    marginRight: 10,
  },
  addButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "mon-b",
  },
  deleteIcon: {
    marginRight: 10, // Adjust spacing between achievement content and delete icon
  },
  generatePDFButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  generatePDFButton: {
    backgroundColor: Colors.primary, // Change the color to a different one
    borderRadius: 8, // Make the button more rounded
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    height: 50,
    width: 200,
  },
  generatePDFButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "mon-b",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  trashIcon: {
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageUploadBox: {
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "white", // Custom color
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    borderColor: "black", // Add black border color
    borderWidth: 1, // Add border width
    marginHorizontal: 10,
  },
  uploadButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  imageContainer: {
    position: "relative",
    marginLeft: 19,
    marginRight: 19,
  },
  removeButton: {
    position: "absolute",
    top: 29,
    right: 5,
  },
  scrollViewContent: {

  },
});


export default Portfolio;

export const addAchievement = async (
  newAchievement: {
    title: string;
    description: string;
    image: string[];
  },
  userId: string, // Assuming userId is passed as an argument
  achievements: { id: number; title: string; description: string; image: string[]; firebaseId: string; }[],
  setAchievements: React.Dispatch<React.SetStateAction<{ id: number; title: string; description: string; image: string[]; firebaseId: string; }[]>>,
  setNewAchievement: React.Dispatch<React.SetStateAction<{ title: string; description: string; image: string[]; }>>,
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  try {
    if (newAchievement.title && newAchievement.description) {
      const achievementData = {
        title: newAchievement.title,
        description: newAchievement.description,
        image: newAchievement.image,
      };
      const achievementDocRef = await addDoc(
        collection(FIRESTORE_DB, 'users', userId, 'achievements'),
        achievementData
      );
      const firebaseId = achievementDocRef.id;

      // Update local state with the new achievement
      setAchievements([
        ...achievements,
        { id: achievements.length + 1, firebaseId, ...achievementData },
      ]);

      // Clear input fields or reset state as needed
      setNewAchievement({ title: "", description: "", image: [] });
      setImages([]);
    }
  } catch (error) {
    console.error("Error adding achievement: ", error);
  }
};

export const deleteAchievement = async (
  userDocRef: any,  // Adjust the type as per your Firestore setup
  achievements: any[], // Adjust the type according to your achievements state
  setAchievements: React.Dispatch<React.SetStateAction<any[]>>, // Adjust the type according to your setAchievements state
  localId: number,
  firebaseId: string
) => {
  const updatedAchievements = achievements.filter(
    (achievement) => achievement.id !== localId
  );
  setAchievements(updatedAchievements);

  try {
    const achievementDocRef = doc(collection(userDocRef, "achievements"), firebaseId);
    await deleteDoc(achievementDocRef);
    console.log("Achievement deleted successfully!");
  } catch (error) {
    console.error("Error deleting achievement:", error);
    // Handle error state or logging as needed
  }
};