import { Slider } from "antd";

export default function TypedOrMandatorySlider() {

  const marks = {
    0: { label: 'Typed', style: { display: 'none' } },
    1: { label: 'Both', style: { display: 'none' } },
    2: { label: 'Mandatory', style: { display: 'none' } },
  }

  return (
    <Slider
      marks={marks}
      step={null}
      max={2}
      included={false}
      style={{ margin: 0 }}
      tooltip={{
        formatter: (v) => v !== undefined && marks[v].label
      }}
    />
  );
}

export function getTypedOrMandatoryNumber(typed?: boolean, mandatory?: boolean) {
  if (!typed && !mandatory) {
    console.error('A property domain (range) can\'t be not typed nor mandatory')
    return 0
  }

  if (typed && !mandatory) {
    return 0
  } else if (typed && mandatory) {
    return 1;
  } else {
    return 2
  }
}

export function getTypedOrMandatoryBooleans(typedOrMandatory?: 0 | 1 | 2): { typed: boolean, mandatory: boolean } {
  return {
    typed: typedOrMandatory === 0 || typedOrMandatory === 1,
    mandatory: typedOrMandatory === 2 || typedOrMandatory === 1
  }
}