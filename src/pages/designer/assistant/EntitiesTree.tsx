import { Empty, Flex, Tree, TreeDataNode, Typography } from "antd";
import { FieldDataNode } from "rc-tree";
import { useContext, useState } from "react";
import EntityIcon from "src/components/EntityIcon";
import { TypesEnum } from "src/gen";
import { NewClassItem, NewItem } from "src/model";
import { ToolbarContext } from "../ToolbarContext";

type EntitiesTreeProps = {
  entitiesData: NewClassItem[],
  checkable?: boolean,
  onCheck?: any,
  onSelect?: any,
}
export default function EntitiesTree(props: EntitiesTreeProps) {

  const { grapholscape } = useContext(ToolbarContext)

  const getTreeDataChild = (item: NewClassItem, index: number, disabled = false): TreeDataNode & { _item: NewItem } => {
    return {
      title: <Flex gap={8}>
        <span><EntityIcon type={item.grapholElement.type} /></span>
        <Typography.Text>{item.grapholEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)}</Typography.Text>
      </Flex>,
      key: `${index}####${item.grapholEntity.iri.fullIri}####${item.grapholElement.diagramId}####${item.grapholElement.id}`,
      children: item.properties?.map(subItem => getTreeDataChild(subItem, index, subItem.grapholElement.type === TypesEnum.OBJECT_PROPERTY)),
      checkable: !disabled,
      _item: item,
    }
  }

  
  const treeData: TreeDataNode[] = [{
    title: 'Entities',
    key: '0',
    children: props.entitiesData?.map((item, i) => {
      return getTreeDataChild(item, i)
    })
  }]
  
  const getKeys = (node: FieldDataNode<TreeDataNode>): React.Key[] => {
    return [
      node.key,
      ...(node.children || []).flatMap(c => getKeys(c))
    ]
  }
  
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(
    getKeys(treeData[0]) as any
  )
  return props.entitiesData.length > 0
    ? <Tree
      checkable={props.checkable !== undefined ? props.checkable : true}
      // style={{ maxHeight: 800 }}
      rootStyle={{ overflowY: "auto" }}
      checkStrictly
      treeData={treeData}
      checkedKeys={Array.from(checkedKeys)}
      defaultExpandAll
      blockNode
      onCheck={(checked: any, info) => {
        const involvedKeys = getKeys(info.node)
        if (info.checked) {
          setCheckedKeys(new Set([...checked.checked, ...involvedKeys]))
        } else {
          setCheckedKeys(new Set(checked.checked.filter(k => !involvedKeys.includes(k))))
        }
        if (props.checkable)
          props.onCheck(checked, info)
      }}
      onSelect={props.onSelect}
    />
    : <Empty description="No entities extracted" />
}