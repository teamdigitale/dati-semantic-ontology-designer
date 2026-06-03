import { TypesEnum } from 'grapholscape';
import React from 'react';
import dataPropertySvg from "src/css/attr.svg";
import dataPropertyMappingIcon from 'src/css/attr_m.svg';
import classSvg from "src/css/class.svg";
import classMappnigIcon from 'src/css/class_m.svg';
import individualSvg from "src/css/individual.svg";
import objectPropertySvg from "src/css/role.svg";
import objectPropertyMappingIcon from 'src/css/role_m.svg';

export default class EntityIcon extends React.Component<{ type: TypesEnum, mapping?: any }> {
  render() {
    return (
      this.props.type === TypesEnum.CLASS
        ? <img src={this.props.mapping ? classMappnigIcon : classSvg} style={{ verticalAlign: 'sub', marginRight: 2 }} alt='' />
        : this.props.type === TypesEnum.OBJECT_PROPERTY
          ? <img src={this.props.mapping ? objectPropertyMappingIcon : objectPropertySvg} style={{ verticalAlign: 'sub', marginRight: 2 }} alt='' />
          : this.props.type === TypesEnum.DATA_PROPERTY
            ? <img src={this.props.mapping ? dataPropertyMappingIcon : dataPropertySvg} style={{ verticalAlign: 'sub', marginRight: 2 }} alt='' />
            : this.props.type === TypesEnum.INDIVIDUAL
            && <img src={individualSvg} style={{ verticalAlign: 'sub', marginRight: 2 }} alt='' />
    )
  }
}
