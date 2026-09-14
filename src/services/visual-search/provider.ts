import { visualSearchConfig } from '../ai/config';
import { NoneVisualSearchProvider } from './providers/none-provider';
import { RemoteVisualSearchProvider } from './providers/remote-provider';

export const createVisualSearchProvider = () => {
  switch (visualSearchConfig.provider) {
    case 'remote':
      return new RemoteVisualSearchProvider(
        visualSearchConfig.remoteUrl,
        visualSearchConfig.remoteApiKey
      );
    default:
      return new NoneVisualSearchProvider();
  }
};
