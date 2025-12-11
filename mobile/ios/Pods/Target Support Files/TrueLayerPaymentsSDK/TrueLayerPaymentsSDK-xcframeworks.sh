#!/bin/sh
set -e
set -u
set -o pipefail

function on_error {
  echo "$(realpath -mq "${0}"):$1: error: Unexpected failure"
}
trap 'on_error $LINENO' ERR


# This protects against multiple targets copying the same framework dependency at the same time. The solution
# was originally proposed here: https://lists.samba.org/archive/rsync/2008-February/020158.html
RSYNC_PROTECT_TMP_FILES=(--filter "P .*.??????")


variant_for_slice()
{
  case "$1" in
  "TrueLayerObjectiveC.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerObjectiveC.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerAPI.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerAPI.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerCore.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerCore.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerLogger.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerLogger.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerMockable.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerMockable.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerNetwork.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerNetwork.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerSDK.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerSDK.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerUI.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerUI.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerUtils.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerUtils.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  "TrueLayerArchitecture.xcframework/ios-arm64")
    echo ""
    ;;
  "TrueLayerArchitecture.xcframework/ios-arm64_x86_64-simulator")
    echo "simulator"
    ;;
  esac
}

archs_for_slice()
{
  case "$1" in
  "TrueLayerObjectiveC.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerObjectiveC.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerAPI.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerAPI.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerCore.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerCore.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerLogger.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerLogger.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerMockable.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerMockable.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerNetwork.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerNetwork.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerSDK.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerSDK.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerUI.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerUI.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerUtils.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerUtils.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  "TrueLayerArchitecture.xcframework/ios-arm64")
    echo "arm64"
    ;;
  "TrueLayerArchitecture.xcframework/ios-arm64_x86_64-simulator")
    echo "arm64 x86_64"
    ;;
  esac
}

copy_dir()
{
  local source="$1"
  local destination="$2"

  # Use filter instead of exclude so missing patterns don't throw errors.
  echo "rsync --delete -av "${RSYNC_PROTECT_TMP_FILES[@]}" --links --filter \"- CVS/\" --filter \"- .svn/\" --filter \"- .git/\" --filter \"- .hg/\" \"${source}*\" \"${destination}\""
  rsync --delete -av "${RSYNC_PROTECT_TMP_FILES[@]}" --links --filter "- CVS/" --filter "- .svn/" --filter "- .git/" --filter "- .hg/" "${source}"/* "${destination}"
}

SELECT_SLICE_RETVAL=""

select_slice() {
  local xcframework_name="$1"
  xcframework_name="${xcframework_name##*/}"
  local paths=("${@:2}")
  # Locate the correct slice of the .xcframework for the current architectures
  local target_path=""

  # Split archs on space so we can find a slice that has all the needed archs
  local target_archs=$(echo $ARCHS | tr " " "\n")

  local target_variant=""
  if [[ "$PLATFORM_NAME" == *"simulator" ]]; then
    target_variant="simulator"
  fi
  if [[ ! -z ${EFFECTIVE_PLATFORM_NAME+x} && "$EFFECTIVE_PLATFORM_NAME" == *"maccatalyst" ]]; then
    target_variant="maccatalyst"
  fi
  for i in ${!paths[@]}; do
    local matched_all_archs="1"
    local slice_archs="$(archs_for_slice "${xcframework_name}/${paths[$i]}")"
    local slice_variant="$(variant_for_slice "${xcframework_name}/${paths[$i]}")"
    for target_arch in $target_archs; do
      if ! [[ "${slice_variant}" == "$target_variant" ]]; then
        matched_all_archs="0"
        break
      fi

      if ! echo "${slice_archs}" | tr " " "\n" | grep -F -q -x "$target_arch"; then
        matched_all_archs="0"
        break
      fi
    done

    if [[ "$matched_all_archs" == "1" ]]; then
      # Found a matching slice
      echo "Selected xcframework slice ${paths[$i]}"
      SELECT_SLICE_RETVAL=${paths[$i]}
      break
    fi
  done
}

install_xcframework() {
  local basepath="$1"
  local name="$2"
  local package_type="$3"
  local paths=("${@:4}")

  # Locate the correct slice of the .xcframework for the current architectures
  select_slice "${basepath}" "${paths[@]}"
  local target_path="$SELECT_SLICE_RETVAL"
  if [[ -z "$target_path" ]]; then
    echo "warning: [CP] $(basename ${basepath}): Unable to find matching slice in '${paths[@]}' for the current build architectures ($ARCHS) and platform (${EFFECTIVE_PLATFORM_NAME-${PLATFORM_NAME}})."
    return
  fi
  local source="$basepath/$target_path"

  local destination="${PODS_XCFRAMEWORKS_BUILD_DIR}/${name}"

  if [ ! -d "$destination" ]; then
    mkdir -p "$destination"
  fi

  copy_dir "$source/" "$destination"
  echo "Copied $source to $destination"
}

install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerObjectiveC.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerAPI.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerCore.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerLogger.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerMockable.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerNetwork.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerSDK.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerUI.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerUtils.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"
install_xcframework "${PODS_ROOT}/TrueLayerPaymentsSDK/Frameworks/TrueLayerArchitecture.xcframework" "TrueLayerPaymentsSDK" "framework" "ios-arm64" "ios-arm64_x86_64-simulator"

