/**
* Cordova Jenkinsfile
*/

//     in RHMAP's case, the following parameters are sent by RHMAP to Jenkins job.
//     this means, the Jenkins job must be a parametrized build with those parameters.
def platform = params?.PLATFORM?.trim()                      // e.g. "ios" or "android"
BUILD_CONFIG = params?.BUILD_CONFIG?.trim()                 // e.g. "Debug" or "Release"
CODE_SIGN_PROFILE_ID = params?.BUILD_CREDENTIAL_ID?.trim()   // e.g. "redhat-dist-dp"

//     To hardcode values uncomment the lines below
//CODE_SIGN_PROFILE_ID = "redhat-dist-dp"
//BUILD_CONFIG = "debug"

// sample values commented below are for https://github.com/feedhenry-templates/saml-cordova-app
/* ------------- use these to hardcode values in Jenkinsfile ---------------- */
PROJECT_NAME = "SAML Client"
CLEAN = true                          // Do a clean build and sign


node(platform) {
    stage("Checkout") {
        checkout scm
    }

    stage("Install local Cordova") {
        sh "npm install cordova@6.3.1"
    }

    stage("Prepare") {
        sh "node_modules/cordova/bin/cordova platform rm $platform"
        sh "node_modules/cordova/bin/cordova platform add $platform"
        sh "node_modules/cordova/bin/cordova prepare $platform"
    }

    stage("Build") {
        withEnv(['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://services.gradle.org/distributions/gradle-2.13-bin.zip']) {
            if (BUILD_CONFIG == 'debug') {
               sh 'node_modules/cordova/bin/cordova build $platform --debug'
            } else {
               sh 'node_modules/cordova/bin/cordova build $platform --release'
            }
        }
    }

    stage("Sign") {
        if (platform == 'android') {
            if (BUILD_CONFIG == 'release') {
                signAndroidApks (
                    keyStoreId: "${params.BUILD_CREDENTIAL_ID}",
                    keyAlias: "${params.BUILD_CREDENTIAL_ALIAS}",
                    apksToSign: "platforms/android/**/*-unsigned.apk",
                    // uncomment the following line to output the signed APK to a separate directory as described above
                    // signedApkMapping: [ $class: UnsignedApkBuilderDirMapping ],
                    // uncomment the following line to output the signed APK as a sibling of the unsigned APK, as described above, or just omit signedApkMapping
                    // you can override these within the script if necessary
                    // androidHome: '/usr/local/Cellar/android-sdk'
                )
            } else {
                println('Debug Build - Using default developer signing key')
            }
        }
        if (platform == 'ios') {
            codeSign(
                profileId: "${CODE_SIGN_PROFILE_ID}",
                clean: CLEAN,
                verify: true,
                appPath: "platforms/ios/build/emulator/${PROJECT_NAME}.app"
            )
        }
    }

    stage("Archive") {
        if (platform == 'android') {
            archiveArtifacts artifacts: 'platforms/android/build/outputs/apk/android-${BUILD_CONFIG}.apk', excludes: 'platforms/android/build/outputs/apk/*-unaligned.apk'
        }
        if (platform == 'ios') {
            archiveArtifacts artifacts: "platforms/ios/build/emulator/${PROJECT_NAME}.ipa"
        }
    }
}
