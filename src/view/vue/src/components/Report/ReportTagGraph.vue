<template>
    <div id="graph"></div>
</template>

<script>
import { onMounted, computed, watchEffect, ref } from 'vue';
import cytoscape from 'cytoscape';
import { useReportStore } from '@stores/report';
import { storeToRefs } from 'pinia';

export default {
  name: 'ReportTagGraph',
  setup() {
    let cy;
    const reportStore = useReportStore();
    const { reportMetadata, testsData } = storeToRefs(reportStore);
    const isMounted = ref(false);

    const graphElements = computed(() => {
      const nodes = reportMetadata.value?.tagList?.map(getGraphNode) ?? [];
      setNodeSizes(nodes);
      const edges = testsData.value?.map((test) => Object.values(getGraphEdges(test))).flat(Number.POSITIVE_INFINITY);
      return [
        ...nodes,
        ...(edges ?? []) ,
      ]
    });

    const setNodeSizes = (nodes) => {
      const tests = testsData.value?.map(getTests).flat(Number.POSITIVE_INFINITY) ?? [];
      const p = tests.find((t) => t.tags.includes('plp'));
      for (const node of nodes) {
        const filteredTests = tests.filter((test) => test.tags.find((tag) => tag.name === node.data.id));
        node.data.count += filteredTests.length;
      }
    }

    const isTest = (item) => ['it', 'test'].includes(item.name);
    const getTests = (container) => {
      return isTest(container) ?
        [container] :
        container.nested?.map(getTests).flat(Number.POSITIVE_INFINITY) ?? [];
    }

    const getGraphNode = (tag) => {
      return { data: { id: tag, count: 0 }};
    }

    const getGraphEdges = (test, parentTags = []) => {
      let combinations = {};
      if (!isTest(test)) {
        test.nested.forEach((childTest) => {
          combinations = {
            ...combinations,
            ...getGraphEdges(childTest, test.tags)
          }
        });
      } else {
        const parentEdges = getUniqueEdges(parentTags, test.tags)
        const siblingEdges = getUniqueEdges(test.tags, test.tags);
        combinations = {
          ...combinations,
          ...parentEdges,
          ...siblingEdges,
        }
      }
      return combinations;
    };

    const getUniqueEdges = (sourceTags, targetTags) => {
      const combinations = {};
      sourceTags.forEach((sourceTag) => {
        targetTags.forEach((targetTag) => {
          if (
            sourceTag.name !== targetTag.name &&
            !combinations[`${sourceTag.name}___${targetTag.name}`] &&
            !combinations[`${targetTag.name}___${sourceTag.name}`]
          ) {
            combinations[`${sourceTag.name}___${targetTag.name}`] = getGraphEdge(sourceTag.name, targetTag.name);
          }
        });
      });
      return combinations;
    }

    const getGraphEdge = (source, target) => {
      return { data: { id: `${source}___${target}`, target: target, source: source } };
    }

    const drawGraph = (elements) => {
      cy = cytoscape({
        container: document.getElementById('graph'),
        elements: elements,

        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)',
              'active-bg-color': '#f00',
              'width': 'data(count)',
              'height': 'data(count)',
              'text-valign': 'center',
              'text-halign': 'center',
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'none',
              'curve-style': 'bezier'
            }
          }
        ],
        layout: {
          name: 'concentric',
          width: 900,
          height: 600
        }
      });

      cy.on('select', 'node', (evt) => {
        const node = evt.target;
        const edges = node.connectedEdges();
        const nodes = edges.connectedNodes();
        edges.style({ 'line-color': 'red' });
        nodes.style({ 'background-color': 'red' });
      });

      cy.on('unselect', 'node', (evt) => {
        const nodes = cy.nodes();
        const edges = cy.edges();
        edges.style({ 'line-color': '#ccc' });
        nodes.style({ 'background-color': '#666' });
      });
    }

    watchEffect(() => {
      if (isMounted.value) {
        drawGraph(graphElements.value);
      }
    })

    onMounted(() => {
      isMounted.value = true;
    });

    return {
      graphElements,
    }
  }
}
</script>

<style lang="less" scoped>
#graph {
  display: block;
  width: 900px;
  height: 900px;
}
</style>