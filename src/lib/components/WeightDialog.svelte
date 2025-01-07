<script lang="ts">
  import { setContext } from "svelte";
  import type {
    WeightData,
    WeightDialogContext,
    WeightInterpretation,
  } from "../types";
  import { getWeightInterpretations, interpretWeight } from "../util";
  import RaisedButton from "./RaisedButton.svelte";
  import reversedList from "../util/reversedList";

  const getValueByUnit = (v: number, i: WeightInterpretation): string => {
    let s = "";

    if (i.data.length === 0) return v.toFixed(2);

    for (let index = i.data.length - 1; index > 0; index--) {
      const currentData = i.data[index];
      console.log(currentData);
      s += `${Math.floor(v / currentData.baseValue)} `;
      v = v % currentData.baseValue;
    }
    s += (v / i.data[0].baseValue).toFixed(2);

    return s.trim();
  };

  const getMainUnit = (
    v: number,
    w: WeightInterpretation,
  ): WeightData | null => {
    if (w.data.length === 0) return null;

    for (let i = 0; i < w.data.length - 1; i++) {
      const j = i + 1;
      if (w.data[j].baseValue > v) {
        return w.data[i];
      }
    }
    return w.data[w.data.length - 1];
  };

  const getMainUnitValue = (v: number, unit: WeightData | null) => {
    if (unit === null) return v.toFixed(2);

    return (v / unit.baseValue).toFixed(2);
    // for (let index = 0; index < i.data.length - 1; index++) {
    //   let nextI = index + 1;
    //   if (i.data[nextI].baseValue > v) {
    //     return (v / i.data[index].baseValue).toFixed(2);
    //   }
    // }
    // return (v / i.data[i.data.length - 1].baseValue).toFixed(2);
  };

  let currentValues: {
    interpretation?: WeightInterpretation;
    value: number;
  } = {
    interpretation: getWeightInterpretations()[0],
    value: 0,
  };
  let parentInterpretation = getWeightInterpretations()[0];

  let onDone: (result: {
    interpretation?: WeightInterpretation;
    value: number;
  }) => unknown = () => {};

  let dialog: HTMLDialogElement;

  let value = currentValues.value.toFixed(2);

  let valueByUnit = getValueByUnit(
    currentValues.value,
    currentValues.interpretation || parentInterpretation,
  );

  let currentMainUnit = getMainUnit(
    currentValues.value,
    currentValues.interpretation || parentInterpretation,
  );
  let mainUnitValue = getMainUnitValue(currentValues.value, currentMainUnit);

  const updateFromValue = (v: string) => {
    const parsed = Number.parseFloat(v);
    if (!isNaN(parsed)) {
      currentValues.value = parsed;
      value = currentValues.value.toFixed(2);
      valueByUnit = getValueByUnit(
        currentValues.value,
        currentValues.interpretation || parentInterpretation,
      );
      currentMainUnit = getMainUnit(
        currentValues.value,
        currentValues.interpretation || parentInterpretation,
      );
      mainUnitValue = getMainUnitValue(currentValues.value, currentMainUnit);
      console.log(valueByUnit);
    }
  };
  const updateFromMainUnit = (v: string) => {
    if (currentValues.interpretation?.data.length === 0) {
      updateFromValue(v);
      return;
    }
    const parsed = Number.parseFloat(v);
    if (!isNaN(parsed)) {
      currentValues.value = parsed * (currentMainUnit?.baseValue ?? 1);
      value = currentValues.value.toFixed(2);
      valueByUnit = getValueByUnit(
        currentValues.value,
        currentValues.interpretation || parentInterpretation,
      );
      currentMainUnit = getMainUnit(
        currentValues.value,
        currentValues.interpretation || parentInterpretation,
      );
      mainUnitValue = getMainUnitValue(currentValues.value, currentMainUnit);
    }
  };

  const updateFromValueByUnit = (v: string) => {
    if (currentValues.interpretation?.data.length === 0) {
      updateFromValue(v);
      return;
    }
    const values = reversedList(v.split(" ")).map((v) => Number.parseFloat(v));
    if (values.length !== currentValues.interpretation?.data.length) {
      throw "Something went wrong";
    }
    let r = 0;
    for (let i = 0; i < values.length; i++) {
      r += values[i] * (currentValues.interpretation?.data[i]?.baseValue ?? 0);
    }

    currentValues.value = r;
    value = currentValues.value.toFixed(2);
    valueByUnit = getValueByUnit(
      currentValues.value,
      currentValues.interpretation || parentInterpretation,
    );
    currentMainUnit = getMainUnit(
      currentValues.value,
      currentValues.interpretation || parentInterpretation,
    );
    mainUnitValue = getMainUnitValue(currentValues.value, currentMainUnit);
  };

  setContext<WeightDialogContext>("weight-dialog", {
    open: (config, parentsInterpretation, callback) => {
      currentValues = config;
      parentInterpretation = parentsInterpretation;
      onDone = callback;

      dialog.showModal();
    },
  });
</script>

<dialog bind:this={dialog}>
  <form>
    <main>
      <div id="lhs">
        <div class="labeled-input">
          <label for="interpretation">Interpretation</label>
          <select
            name="weight-interpretation"
            bind:value={currentValues.interpretation}
          >
            <option value={undefined}>Inherit</option>
            {#each getWeightInterpretations() as weightInterpretation}
              <option value={weightInterpretation}>
                {weightInterpretation.name}
              </option>
            {/each}
          </select>
        </div>
        <div class="labeled-input">
          <p>Final look</p>
          <div class="card">
            {interpretWeight(
              currentValues.interpretation || parentInterpretation,
              currentValues.value,
            )}
          </div>
        </div>
      </div>
      <div id="divider"></div>
      <div id="rhs">
        <div class="labeled-input">
          <label for="value">Value</label>
          <input
            name="value"
            bind:value
            on:change={(e) => updateFromValue(e.target.value)}
          />
        </div>
        <div class="labeled-input">
          <label for="main-unit">As main unit</label>
          <input
            bind:value={mainUnitValue}
            on:change={(e) => updateFromMainUnit(e.target.value)}
          />
        </div>
        <div class="labeled-input">
          <label for="by-unit">By unit</label>
          <input
            bind:value={valueByUnit}
            on:change={(e) => updateFromValueByUnit(e.target.value)}
          />
          <p class="unit-marks">
            {#each reversedList((currentValues.interpretation || parentInterpretation).data) as data}
              <span>{`${data.abbreviation} `}</span>
            {/each}
          </p>
        </div>
      </div>
    </main>
    <div class="buttons">
      <RaisedButton
        on:click={() => {
          onDone(currentValues);
          dialog.close();
        }}
        type="button"
      >
        Submit
      </RaisedButton>
      <RaisedButton type="button" on:click={() => dialog.close()}>
        Cancel
      </RaisedButton>
    </div>
  </form>
</dialog>
<slot />

<style>
  dialog {
    background-color: #eee;
    border: none;
    width: min(800px, 80%);
  }

  form {
    display: flex;
    flex-direction: column;

    padding: 1rem;
  }

  main {
    display: flex;
    flex: 1;
  }

  p {
    margin: 0px;
    padding: 0px;
  }

  p.unit-marks {
    margin-left: 0.5rem;
    font-size: 0.9rem;
  }

  #lhs,
  #rhs {
    display: flex;
    flex-direction: column;
    flex: 1;

    justify-content: space-evenly;
  }

  select {
    padding: 0.5rem;
    border-radius: 5px;
    border: none;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

  #divider {
    width: 1px;
    height: 200px;
    background-color: #aaaaaa;
    margin: 1rem;
  }

  div.labeled-input {
    display: flex;
    flex-direction: column;
  }

  div.card {
    font-size: 1.5rem;
    padding: 1rem;

    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: white;
    border-radius: 5px;
  }

  input {
    padding: 0.5rem;
    border-radius: 5px;
    border: none;

    box-shadow:
      rgb(219, 219, 219) 3px 3px 6px 0px inset,
      rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
  }
</style>
