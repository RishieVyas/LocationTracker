import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
    getLocation(): void;
}

export default TurboModuleRegistry.get<Spec>('RTNMyLocation') as Spec | null;