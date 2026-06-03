import { Descriptions, Popover, Typography } from "antd"
import { DefaultAnnotationProperties, GrapholEntity } from "grapholscape"
import { ontologyLabelAnnProp } from "./EntityCatalogQueryManager"

export default function EntityCatalogMetadataPreview({ entity, language }: { entity: GrapholEntity, language: string }) {
  const ontologyIri = entity.getAnnotations(undefined, DefaultAnnotationProperties.isDefinedBy)[0]?.value
  const ontologyLabel = entity.getAnnotations(undefined, ontologyLabelAnnProp)[0]?.value

  const metadata = {
    IRI: entity.iri.fullIri,
    label: entity.getLabels(language)
      .map((label, i) => <p key={`label-${i}`}><Typography.Text>{label.value}</Typography.Text> <Typography.Text type="secondary">@{label.language}</Typography.Text></p>),
    comment: entity.getComments(language)
      .map((comment, i) => <p key={`comment-${i}`}><Typography.Text>{comment.value}</Typography.Text> <Typography.Text type="secondary">@{comment.language}</Typography.Text></p>),
    definedBy: (ontologyLabel || ontologyIri) && <Popover content={ontologyIri}>{ontologyLabel || ontologyIri}</Popover>,
  }

  return <Descriptions
    // columns={Object.keys(metadata).map((key) => ({ title: key.charAt(0).toUpperCase() + key.slice(1), dataIndex: key }))}
    size="small"
    bordered
    column={1}
    style={{ width: 550 }}
    items={Object.entries(metadata).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      children: !value || value['length'] === 0
        ? <Typography.Text type="secondary">N/A</Typography.Text>
        : typeof value === 'string'
          ? <Typography.Text>{value}</Typography.Text>
          : value,
    }))}
  />
}