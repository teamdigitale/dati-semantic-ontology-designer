import { GrapholEntity } from "grapholscape";
import { createContext } from "react"
import { GrapholscapeDesigner } from "src/builder"

type ToolbarContextType = {
  grapholscape?: GrapholscapeDesigner
  remoteCatalogEntities: GrapholEntity[]
  setRemoteCatalogEntities: (entities: GrapholEntity[]) => void
  designerAssistantSettings: {
    iriStyle: boolean
    simpleNameLanguage: string
  }
  setDesignerAssistantSettings: (newSettings) => void
}

export const ToolbarContext = createContext<ToolbarContextType>({
  grapholscape: undefined,
  remoteCatalogEntities: [],
  setRemoteCatalogEntities: () => { },
  designerAssistantSettings: {
    iriStyle: true,
    simpleNameLanguage: 'en',
  },
  setDesignerAssistantSettings: () => { }
})