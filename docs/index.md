---
title: Ontology Designer
nav_order: 1
---

# Introduction
The Ontology Designer is a tool that lets you graphically create and edit an ontology.
It automatically optimizes the layout of the nodes in the ontology.


![designer](images/designer.png)

In this environment you will be able either to [create a new ontology](#creating-a-new-ontology) or to [edit](#editing-an-ontology) an existing one.

# Creating or editing an ontology
To start using the ontology designer you cant start developing a new ontolgy by providing an ontology IRI and version. Otherwise you can modify an existing ontology by importing the OWL file.
In order to create a new ontology, you need to choose the IRI and the version. They can be modified later in the [settings](#ontology-manager).
In the initial menu, you can import an existing ontology and then continue editing it.
You can read more about importing an ontology in the settings' section since the process is exactly the same: [Import Ontology](#import-ontology).


# Main Toolbar

Through the **Toolbar** you can add any kind of new element to the ontology, from diagrams to nodes and edges to the ontology metadata, and you can save the current.

![designer_toolbar](images/designer-toolbar.png)

In detail, the available commands are:

  - **Add Diagram**, from which you can add a new diagram;
  - **Rename Diagram**, from which you can rename the current diagram;
  - **Delete Diagram**, from which you can delete the current diagram with all its elements;
  - [**Add Class Node**](#add-class-node), from which you can add one or more new class nodes;
  - [**Add Data Property Node**](#add-data-property-node), from which you can add one or more new data property nodes;
  - [**Add Object Property Edge**](#add-object-property-edge), enabled only in case a class node is selected, from which you can add a new object property edge;
  - [**Add Individual Node**](#add-individual-node), from which you can add one or more new individual nodes;
  - [**AI Design**](#-design), from which you can issue requests to the AI Assistant in order to build fragments of your ontology
  - **Language Selection**: from which you can choose the language of the labels shown over the ontology entities, if they exists. If no label in such language is present, any other label will be shown.
  This language is also used as default for labels generated for new entities.
  - [**Ontology Settings**](#settings), that gives access to the ontology settings;
  - **Preview OWL** to open a drawer showing the OWL translation of the current ontology;
  - [**Entity Catalog**](#entity-catalog) to import entities from a specified SPARQL Endpoint;
  - **Download**, to save the current state of the ontology;
  - [**AI Explain**](#explain) to submit questions to an AI Assistant about the current ontology in order to clarify logic aspects or to explain the meaning of certain axioms.
  - **Help** to show this user manual

Along with the toolbar, each element you can see in the diagrams is provided with a **Contextual Menu** that can be accessed through a right-click on the element itself.
The commands that you can find in a node (or edge) contextual menu change based on the kind of element the menu belongs to. The most basic menu is the one that only provides the *remove* command. In the following sections we will see the more significant contextual menus.

## Class Node Contextual Menu
The richest contextual menu is the one related to the class nodes.

![class_cxtmenu](images/designer-classcxtmenu.png)


The available commands are:
  - [**AI Generate**](#context-menu-generation), giving you access to generative AI to create
    - **Data Properties**
    - **Subhierarchy**
    - **Class Description** (rdfs:comment annotation)
  - [**Add Data Property**](#add-data-property-node), from which you can add new data property nodes and the related data properties will have the current class as domain;
  - [**Add Object Property**](#add-object-property-edge), from which you can draw a new object property edge and the related object property will have the current class as domain;
  - [**Add Individual**](#add-individual-node), from which you can add new individual nodes and the related inviduals will be instances of the current class;
  - [**Add Class in IS-A**](#add-class-in-is-a), from which you can add a new class node in IS-A with the current class;
  - [**Add Subhierarchy**](#add-subhierarchy), from which you can add a new set of class nodes that will make up a subhierarchy for the current class;
  - **Add Subclass Edge**, from which you can draw a new subclass edge;
  - [**Edit**](#edit), from which you can either rename or refactor the entity and edit its properties. In case of refactor, all the nodes of this entity will be changed. Also, you can choose whether to update the label or not;
  - [**Edit Annotations**](#edit-annotations), from which you can add, edit or remove the class annotations;
  - **Remove**, from which you can either delete the single element or all the nodes of this entity. If you choose to remove all the occurrences, the entity itself will be deleted.

## Data Property Node Contextual Menu

![dp_cxtmenu](images/designer-dpcxtmenu.png)

For what concerns the data properties, the available actions are:

  - **AI Generate** in case of data properties it only allows you to obtain a possible description of the selected data property.
  - **Add Inclusion Edge**, from which you can draw a new sub-dataproperty edge;
  - **Add to Class**, from which you can draw a new data property edge to the domain class;
  - [**Edit**](#edit), from which you can either rename or refactor the entity and edit its properties. In case of refactor, all the nodes of this entity will be changed. Also, you can choose whether to update the label or not;
  - [**Edit Annotations**](#edit-annotations), from which you can add, edit or remove the data property annotations;
  - **Remove**, from which you can either delete the single element or all the nodes of this entity. If you choose to remove all the occurrences, the entity itself will be deleted.

Furthermore, you can toggle the functionality of the data property by double-clicking on the node.

## Individual Node Contextual Menu

![individual_cxtmenu](images/designer-individualcxtmenu.png)

The available commands on the individual nodes are:

  - **Add Instance Edge**, from which you can draw a new instance edge linking the individual to its parent class;
  - [**Edit**](#edit), from which you can either rename or refactor the entity. In case of refactor, all the nodes of this entity will be changed. Also, you can choose whether to update the label or not;
  - [**Edit Annotations**](#edit-annotations), from which you can add, edit or remove the individual annotations;
  - **Remove**, from which you can either delete the single element or all the nodes of this entity. If you choose to remove all the occurrences, the entity itself will be deleted.

## Object Property Edge Contextual Menu

![op_cxtmenu](images/designer-opcxtmenu.png)

For what concerns the object properties, the possible actions are the basic ones:

  - [**Edit**](#edit), from which you can either rename or refactor the entity. In case of refactor, all the nodes of this entity will be changed. Also, you can choose whether to update the label or not;
  - [**Edit Annotations**](#edit-annotations), from which you can add, edit or remove the object properties annotations;
  - **Remove**, from which you can either delete the single element or all the nodes of this entity. If you choose to remove all the occurrences, the entity itself will be deleted.

Furthermore, you can change the domain/range of the object property by moving its source/target anchors.

## Hierarchy Node Contextual Menu

The last relevant contextual menu is the one available for hierarchy nodes.

![hierarchy_cxtmenu](images/designer-hierarchycxtmenu.png)

This menu gives you the possibility to:

  - **Add Inclusion Edge**, from which you can draw an inclusion edge linking the hierarchy to a parent class;
  - **Add Input Edge**, from which you can draw an input edge linking the hierarchy to a subclass;
  - **Remove**, from which you can remove the hierarchy itself.

Also, by toggling the node you can change the disjointness of the hierarchy, whereas by toggling an inclusion edge you can change the completeness.

# Main Commands

We have seen in the previous section the commands provided by the contextual menus and by the toolbar. However, some of these commands need a deeper description.

## Add Class Node

![Add New Class](images/designer-addnewclass.png)

![Class Advanced Settings](images/designer-classadvstngs.png)

One of the first steps towards building an ontology surely is adding new classes. In the designer environment you can do so by specifying the name of the class, from which the system will automatically generate the IRI.
You can add more than one class by clicking on the '+' button.

You can also access the **Advanced Settings** from where you can change both the namespace and the label settings. You can indeed choose whether to automatically retrieve the label from the name, specify the language of the said label and decide if a case conversion has to be applied.

## Add Data Property Node

![Add New Data Property](images/designer-addnewdp.png)

In order to add a new data property node, you can type the name, choose the datatype from the listing and specify whether the data property is functional. As for the classes, you can add more than one data property by clicking on the '+' button.

Also, you can access the **Advanced Settings** from where you can change both the namespace and the label settings.

### Value Constraints
The value constraints section allows you to specify constraints and conditions for the data property's value to meet.

Available kind of constraints vary depending on the specified data property's **datatype**. There are three main categories having different kind of constraints.

- **Numbers**:
  - **>** | **>=** value must be greater (or equal) than a certain value
  - **<** | **<=** value must be lower (or equal) than a certain value
  - **Less than value of** value must be lower than the value of another data property defined on the same domain class
  - **Possible Values** a list of admitted values

- **xsd:string**:
  - **Minimum Length** Specifies a minimum length for the string value
  - **Maximum Length** Specifies a maximum length for the string value
  - **Possible Values** a list of admitted values

- **All others datatypes**:
  - **Possible Values** a list of admitted values

## Add Individual Node

The process for adding a new individual node is the same as for adding a new class. Here too, after typing the name of the individual, you can add more than one by clicking on the '+' button or access the **Advanced Settings**.

## Add Object Property Edge

![Add New Oject Property](images/designer-addnewop.png)

Once you have drawn an object property edge, you have to name it and, through the **Advanced Settings**, you can also specify its properties, along with the namespace and the label settings.

It's also possible to specify cardinality constraints and properties for the defined object property.
Domain and range could both be either:
 - **Typed**: meaning that instances in the domain/range set are of a certain type (class).
 - **Mandatory**: meaning that any instance of the class specified as source/target **must** participate to this relationship
 - **Both**: both previous conditions are applied at the same time

## Add Class in IS-A

This command gives you the possibility to [add a new class node](#add-class-node) and at the same time specify whether it is a subclass or a parent class of the current one.

## Add Subhierarchy

Much like the previous command, here too you [add new class nodes](#add-class-node) that will form a new subhierarchy for the current class. Also, you can specify the disjointness and the completeness of this subhierarchy.

## Edit

By editing a node, you can modify the entity name and properties. Alongside, you can choose whether to update the label or not.

Only the entities of type **class** you can also choose if the changes must affect every occurrence or only the selected one.
In case only the selected one must be modified, a new **class** will be created.

## Edit Annotations

![Edit Annotations](images/designer-editannotations.png)

Here you can find the list of annotations of the current entity. Each of these can be edited, deleted or you can add a brand new annotation.


# Settings

The Settings modal contains several sections in order to manage different aspects of the ontology and the Ontology Designer.

- [Ontology Manager](#ontology-manager)
- [Entity Names](#entity-names)
- [Rendering](#rendering)
- [Import Ontology](#import-ontology)
- [Entity Catalog](#entity-catalog): to specify the SPARQL Endpoint URL from which entities will be retrieved to be easily imported in the current ontology.
- [Metadata](#metadata)
- [AI Assistant Settings](#ai-assistant-settings)

## Ontology Manager

Up until here we have explored the available actions that affect the single elements of the draft ontology. In the ontology manager instead you can explore the ontology metadata.

![Ontology Manager](images/designer-settings-ontologymanager.png)

Here you have four tabs:
  - **Ontology IRI**, where you can change the ontology IRI and the version IRI;
  - **Ontology Annotations**, where you can find all the ontology annotations. You can edit them, delete them or add new ones;
  - **Annotation Properties**, where you find all the standard annotation properties, such as the label and comment ones. Here as well you can edit, delete or add new properties;
  - **Namespaces**, where you can find all the namespaces defined in the current ontology, along with the associated prefixes. Each of these can be edited, deleted and you can add new ones.
  - **Entity Annotations**, where you can find all the annotations defined in the current ontology for every entity (subject of the annotation). You can also download them as a CSV/Excel file or upload the annotations via the *Import* button from a CSV file.

## Entity Names
![Entity Names](images/designer-settings-entitynames.png)

In this section you can change the **global** settings for the names of the the entities you will create later on.

Specifically you can choose which namespace will be used to generate IRIs for new entities.
You can also choose whether to automatically generate a new entity's label from the name, and decide if a case conversion has to be applied.

> These settings will be available also when creating a new entity, in that case the selected options will only affect the created entity and will not change the global settings.

## Rendering
![Rendering](images/designer-settings-rendering.png)

The rendering section lets you change the displayed name for the ontology's entities, the theme of the application and whether to highlight or not entities that have been generated by the [AI Designer Assistant](#design)

## Import Ontology
![Import Ontology](images/designer-settings-importowl.png)

The import ontology section allows you to import other ontologies from a file or a URL.

Admitted formats are: `.gscape` `.owl` `.ttl` `.n3` `.rdf` `.ofn` `.owx`.

Where `.gscape` is the native JSON format used by the Ontology Designer to natively parse and serialize ontologies.

In case other formats are submitted, a conversion will be done and an approximation phase will remove axioms that are out of the expressiveness of the Ontology Designer.
This is due to the fact that an ontology graphical representation must have a limited expressiveness to keep the graph easy to read and navigate interactively.

## Metadata
![Ontology Metadata](images/designer-settings-metadata.png)

This form helps you add to the ontology the metadata which are necessary in order to publish an ontology to [NDC](https://schema.gov.it) site. These metadata are defined by the _Asset Description Metadata Schema Ontology - Italian Application Profile_ available [here](https://schema.gov.it/lode/extract?url=https://w3id.org/italia/onto/ADMS).

Notice that by hovering with the mouse over the label of the form item you can see (and follow the link) to the OWL Annotation that will be used to describe that metadata. Some metadata, for instance "Rights Holder", are more complex than the others because this annotation requires an individual as its values, and not a simple literal. 

To assist in defining these annotations, the form will suggest the individuals that have been added to the catalog through previously loaded ontologies (annotated as _external_). These individuals are all considered as instances of the http://xmlns.com/foaf/0.1/Agent class. If the individual you need is not in this list, and therefore has not been previously used in any annotation for the ontologies loaded in the catalog, you can add it by clicking on the nearby `+` button. Another drawer will pop up, allowing you to add additional properties for the _Agent_ you are defining. Once finished, it will be available for selection from the "Rights Holders" list. Notice that once an individual has been added, it can be reused across different ontologies and across different annotation properties (e.g. Agents will be available for "Publisher" and "Creator" as well).

You can save these metadata whenever you want, or import them from another ontology (_Import_ button). In these case only relevant annotations will be imported (no axioms involved).

## AI Assistant Settings
![AI Assistant Settings](images/designer-settings-aiassistant.png)

To change the way the [AI Designer Assistant](#design) will generate new entity IRIs.

Specifically you can choose the language of the variable part (the *simple name*) of a generated entity IRI and if it must use a snake case or a camel case.

> Changing such settings between subsequent requests in the same session might have undesired results since the system relies on these *simple names* to match and reconciliate existing entities with newly generated ones.

# Entity Catalog
The entity catalog provides you a way to easily import entities from a remote SPARQL endpoint. The URL to reach and query the SPARQL Endpoint can be set in the proper [Settings](#settings)'s section.

![Entity Catalog](images/designer-entitycatalog.png)

You can filter by entity type and/or search by the **Label** or the **IRI**, search a text in comments or by the **isDefinedBy** annotation value defined over the entities.

You can choose to import multiple entities as long as the selected entities does not include an object property.

You can only import one object property at a time since you must specify which classes will be used as domain and range (i.e. the source and target class nodes) as shown in the modal below.

![OP Import](images/designer-entitycatalog-op.png)

# AI Assistant
The ontology designer is equipped with an AI Assistant to help you speeding up the process of designing your ontology or alternatively to explain and give you insights about the current ontology.

Throughout the application, the commands triggering processes and workflows managed by the AI Assistant are identified by an orange gradient color.

There are mainly three ways to use the AI Assistant: [Context Menu Generation](#context-menu-generation), [Design](#design), [Explain](#explain).

## Context Menu Generation

![Class Context Menu](images/designer-classcxtmenu.png)

By right-clicking over an entity, the *AI Generate* will allow you to generate things based on the entity type.

- **Class**: you can generate a set of data properties, a classes sub-hierarchy or a description.
- **Data Property**: you can only generate a description.

Generating descriptions and sub-hierarchies throught the AI Assistant is also available in the modal dedicated to such commands.

## Design
By clicking on the **Design** button in the [Toolbar](#main-toolbar), you can provide a natural language description of your domain of interest in order to get a possible ontological representation of such domain.

![AI Design](images/designer-aidesign.png)

The result will be shown both in the ontology graph (on the left) and as a tree list of generated entities (on the right).
In the tree list, data properties and object properties are grouped by the generated classes they are attached to.
You can choose whether to accept or reject everything or to only accept a subset of entities.

> Object properties cannot be selectively rejected. This is due to the fact that those entities are always attached to two classes and you might end up in a inconsistent state where an object property has no source/target node.

## Explain
By clicking on the **Explain** button in the [Toolbar](#main-toolbar), you can ask questions about the current ontology to the AI Assistant.

The assistant will try to use the current ontology as context in order to provide only relevant answers. Any reference to entities in the ontology will be highlighted allowing you to quickly navigate the ontology graph in order to get more information and details about the selected entity.

## AI History
Both the [Design](#design) and the [Explain](#explain) modes have their own history from which you can see every issued request. Every history item shows you the submitted text along with the response or result provided by the assistant.

> AI Assistant histories are not preserved through different sessions, this means that you can see your previous requests as long as the current session stays active. Whenever a new session is started, the history will be reset.