import { Modal, Text, View } from "react-native";
import { useState, useEffect } from "react";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function SignInModal({ isVisible, onClose }: Props) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(isVisible);

  useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <View className={"h-1/3"} onTouchEnd={handleClose} />
        <View className="h-2/3 bg-white rounded-t-3xl p-6">
          <Text>Sign In</Text>
        </View>
      </View>
    </Modal>
  );
}
