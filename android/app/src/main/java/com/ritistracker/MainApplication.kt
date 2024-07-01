package com.ritistracker

import android.content.Context
import androidx.multidex.MultiDexApplication
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.ritistracker.LocationPackage
import java.lang.reflect.InvocationTargetException

class MainApplication : MultiDexApplication(), ReactApplication {

  private val mReactNativeHost = object : ReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean {
      return BuildConfig.DEBUG
    }

    override fun getPackages(): List<ReactPackage> {
      val packages = PackageList(this).packages
      // Packages that cannot be autolinked yet can be added manually here, for example:
      // packages.add(MyReactNativePackage())
      packages.add(LocationPackage())
      return packages
    }

    override fun getJSMainModuleName(): String {
      return "index"
    }
  }

  override val reactNativeHost: ReactNativeHost
    get() = mReactNativeHost

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, /* native exopackage */ false)
    initializeFlipper(this, mReactNativeHost.reactInstanceManager)
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private fun initializeFlipper(context: Context, reactInstanceManager: ReactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        // We use reflection here to pick up the class that initializes Flipper,
        // since Flipper library is not available in release mode
        val aClass = Class.forName("com.ritistracker.ReactNativeFlipper")
        aClass.getMethod("initializeFlipper", Context::class.java, ReactInstanceManager::class.java)
          .invoke(null, context, reactInstanceManager)
      } catch (e: ClassNotFoundException) {
        e.printStackTrace()
      } catch (e: NoSuchMethodException) {
        e.printStackTrace()
      } catch (e: IllegalAccessException) {
        e.printStackTrace()
      } catch (e: InvocationTargetException) {
        e.printStackTrace()
      }
    }
  }
}
