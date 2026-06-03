import { Form, Select } from 'antd';
import { GrapholEntity, TypesEnum } from 'grapholscape';
import { Component } from 'react';
import { GrapholscapeDesigner } from 'src/builder';
import EntityIcon from 'src/components/EntityIcon';

interface Props {
  grapholscape?: GrapholscapeDesigner,
  property: string,
}

class KeyClassSelector extends Component<Props> {
  state: { classes: GrapholEntity[] } = {
    classes: []
  }

  componentDidMount() {
    if (this.props.grapholscape) {
      const classes = this.props.grapholscape.ontology.getEntitiesByType(TypesEnum.CLASS)
      this.setState({ classes })
    }
  }

  render() {
    return (
      <Form.Item name={this.props.property} style={{ width: '100%', margin: 0 }}>
        <Select mode="multiple" options={this.state.classes.map(i => ({
          value: i.iri.fullIri,
          label: <span>
            <EntityIcon type={TypesEnum.CLASS} />
            {i.getDisplayedName(this.props.grapholscape.entityNameType, this.props.grapholscape.language)}
          </span>
        }))} showSearch />
      </Form.Item>
    );
  }
}

export default KeyClassSelector;