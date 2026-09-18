import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, InputNumber, Select, Table } from "antd";
import { Rule } from "antd/es/form";
import { DefaultOptionType } from "antd/es/select";
import { useContext, useEffect, useState } from "react";
import { getColumnSearchProps } from "src/utils/utils";
import { ToolbarContext } from "../ToolbarContext";
import { getEditDeleteButtons } from "./OntologyManager";

type ImportDeclarationRecord = {
  key: string,
  value: string,
  title: string,
}


export default function ImportDeclarations({ ...props }) {

  const { grapholscape } = useContext(ToolbarContext)
  const [form] = Form.useForm();
  const originalData = grapholscape.ontology.importDeclarations.map(importDecl => ({
    key: importDecl,
    value: importDecl,
    title: importDecl,
  }))
  const [importDeclarationsData, setImportDeclarationsData] = useState<ImportDeclarationRecord[]>(originalData)
  const [recordToEdit, setRecordToEdit] = useState<ImportDeclarationRecord | undefined>()

  useEffect(() => {
    return () => {
      grapholscape.ontology.importDeclarations = importDeclarationsData.filter(record => record.value !== '').map(record => record.value)
    }
  }, [grapholscape, importDeclarationsData])

  // const getFreshData = () => importDeclarationsData

  return <><Form form={form} component={false}>
    <Table<ImportDeclarationRecord>
      size='small'
      columns={[
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
          // minWidth: 400,
          render: (text, record) => <EditableCell
            children={<Button type="link" href={text} target="_blank">{text}</Button>}
            editing={recordToEdit && recordToEdit.value === text}
            dataIndex={'value'}
            title={'Import Declaration Value'}
            inputType={"text"}
            record={record}
            required
            rules={[
              () => ({
                validator(_, value) {
                  if (!value || !importDeclarationsData.find(v => v.key === value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Import declaration already exists."));
                },
              }),
            ]}
          />,
          ...getColumnSearchProps('value'),
        },
        {
          title: '',
          key: 'key',
          dataIndex: 'key',
          width: 90,
          render: (_, record) => {
            // The index passed by the render callback referes to the index in the DOM
            // but that index might change due to sorting, sorting does not change indexes
            // in importDeclarationsData => use the realIndex to edit/delete the correct record.
            const realIndex = importDeclarationsData.findIndex(r => r.key === record.key)
            if (recordToEdit === record) {
              return <Flex>
                <Button style={{ padding: "0 5px" }} type="link" onClick={() => {
                  form.validateFields().then(() => {
                    const newRecord = {
                      key: form.getFieldValue('value'),
                      value: form.getFieldValue('value'),
                      title: form.getFieldValue('value'),
                    }
                    const _newImportDeclarations = [...importDeclarationsData]
                    _newImportDeclarations.splice(realIndex, 1, newRecord)
                    setImportDeclarationsData(_newImportDeclarations)
                    setRecordToEdit(undefined)
                  })
                }}>
                  Save
                </Button>
                <Button style={{ padding: "0 5px" }} type="link" onClick={() => {
                  setRecordToEdit(undefined)
                  setImportDeclarationsData(importDeclarationsData.filter(record => record.value !== ''))
                }}>
                  Cancel
                </Button>
              </Flex>
            } else {
              return getEditDeleteButtons(
                () => {
                  form.setFieldsValue({ ...record });
                  setRecordToEdit(record)
                }, // onEdit
                () => {
                  const newImportDeclarationsData = [...importDeclarationsData]
                  newImportDeclarationsData.splice(realIndex, 1)
                  setImportDeclarationsData(newImportDeclarationsData)
                }, // onDelete
                { edit: { disabled: !!recordToEdit }, delete: { disabled: !!recordToEdit } }
              )
            }
          }
          ,
        }
      ]}
      dataSource={importDeclarationsData}
      pagination={false}
    />
  </Form>
    <Button
      key="add"
      disabled={!!recordToEdit}
      onClick={() => {
        const newRecord = { value: '', key: '', title: '' }
        setImportDeclarationsData([
          ...importDeclarationsData,
          newRecord
        ])
        form.setFieldsValue({ ...newRecord })
        setRecordToEdit(newRecord)
      }}
      icon={<PlusOutlined />}
      type="primary"
      style={{ marginTop: '24px', float: "right" }}>
      Add
    </Button>
  </>
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select';
  record: any;
  required?: boolean;
  options?: DefaultOptionType[],
  rules?: Rule[]
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex, // the value to be assigned to the input
  title,
  inputType,
  record,
  children,
  required = false,
  options = [],
  rules = [],
  ...restProps
}) => {
  let inputNode
  switch (inputType) {
    default:
    case 'text':
      inputNode = <Input size="small" />
      break

    case 'number':
      inputNode = <InputNumber size="small" />
      break

    case 'select':
      inputNode = <Select options={options} size="small" />
      break

  }

  return (
    <>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: required,
              message: `Please Input ${title}!`,
            },
            ...rules,
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </>
  );
};