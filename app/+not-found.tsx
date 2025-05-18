import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
// Update the import path below to the correct location of your Text component.
// For example, if the file is at 'components/ui/text', use:
import { Text } from '../components/ui/text';
// Or adjust the path as needed based on your project structure.

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text>This screen doesn't exist.</Text>

        <Link href='/'>
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
