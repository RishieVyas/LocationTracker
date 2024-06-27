package com.rtnmylocation;

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class MyLocationPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == MyLocationModule.NAME){
        MyLocationModule(reactContext)
    } else {
        null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
        val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
        moduleInfos[MyLocationModule.NAME] = ReactModuleInfo(
            MyLocationModule.NAME,
            MyLocationModule.NAME,
            false,
            false,
            true,
            false,
            true
        )
        moduleInfos
    }
  }
}