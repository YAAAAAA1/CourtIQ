#!/bin/bash

echo "📂 Moving to project folder…"
cd /Users/jonahdovdavany/Downloads/TheOfficialHoopMaster || exit 1

echo "🧹 Cleaning node_modules, lockfiles…"
rm -rf node_modules
rm -f package-lock.json yarn.lock

echo "📦 Reinstalling npm dependencies…"
npm install

echo "🔷 Ensuring .watchmanconfig exists…"
if [ ! -f ".watchmanconfig" ]; then
  echo "{}" > .watchmanconfig
  echo "✅ Created .watchmanconfig"
else
  echo "✅ .watchmanconfig already exists"
fi

echo "🖋️ Creating missing PrivacyInfo.xcprivacy files if needed…"
mkdir -p node_modules/react-native/React/Resources
echo '{ "privacy": [] }' > node_modules/react-native/React/Resources/PrivacyInfo.xcprivacy

mkdir -p node_modules/react-native/ReactCommon/cxxreact
echo '{ "privacy": [] }' > node_modules/react-native/ReactCommon/cxxreact/PrivacyInfo.xcprivacy

echo "✅ PrivacyInfo.xcprivacy files created"

echo "⬆️ Upgrading react-native-svg to latest…"
npm install react-native-svg@latest

echo "🧹 Cleaning CocoaPods…"
cd ios || exit 1
rm -rf Pods Podfile.lock

echo "📦 Installing CocoaPods…"
pod install

echo "✅ Pods installed. Cleaning Xcode DerivedData…"
cd ..
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "🎯 Done! Now open ios/TheOfficialHoopMaster.xcworkspace in Xcode and build, or run:"
echo "➡️  npx react-native run-ios"

echo "🚀 All cleanup & fixes complete."
