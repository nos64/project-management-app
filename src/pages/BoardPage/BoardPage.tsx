import { ROUTES } from 'common/routes';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './BoardPage.module.scss';
import Column from '../../components/Column';
import { FaLessThan } from 'react-icons/fa';
import NewColumn from '../../components/NewColumn';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { initialColumns } from 'data/initialBoardData';
import { moveTask, reorderTasks } from 'utils/dnd-helper';
import { DndType } from 'common/dnd-types';

const BoardPage = () => {
  const boardTitle = 'board title';
  const boardDescription = 'Booard description';

  const sortedColumns = initialColumns.sort((col1, col2) => (col1.order < col2.order ? -1 : 1));

  const [columns, setColumns] = useState(sortedColumns);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === DndType.COLUMN) {
      const removedColumn = columns.find((column) => column._id === draggableId);
      if (!removedColumn) return;

      const newColumns = columns.filter((column) => column._id !== draggableId);
      newColumns.splice(destination.index, 0, removedColumn);

      const newOrderedColumns = newColumns.map((column, index) => ({ ...column, order: index }));

      setColumns(newOrderedColumns);
      return;
    }

    const sourceColumn = columns.find((item) => item._id == source.droppableId);
    if (!sourceColumn || !sourceColumn.tasks) return;

    if (destination.droppableId !== source.droppableId) {
      const destinationColumn = columns.find((item) => item._id == destination.droppableId);
      if (!destinationColumn) return;

      const newDestinationColumn = moveTask(source, destination, sourceColumn, destinationColumn);

      const newColumns = [
        ...columns.filter(
          (item) => item._id !== source.droppableId && item._id !== destination.droppableId
        ),
        sourceColumn,
        newDestinationColumn,
      ].sort((col1, col2) => (col1.order < col2.order ? -1 : 1));

      setColumns(newColumns);
    } else {
      const newSourceColumn = reorderTasks(source, destination, sourceColumn);

      const newColumns = [
        ...columns.filter((item) => item._id !== source.droppableId),
        newSourceColumn,
      ].sort((col1, col2) => (col1.order < col2.order ? -1 : 1));

      setColumns(newColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.pageContent}>
        <div className={styles.topBlock}>
          <Link className={styles.backBtn} to={ROUTES.BOARDS}>
            <FaLessThan className={styles.backBtnIcon} />
            <span>Back</span>
          </Link>
          <div className={styles.boardInfo}>
            <h3 className={styles.title}>{`Board: ${boardTitle}`}</h3>
            <p className={styles.description}>{boardDescription}</p>
          </div>
        </div>
        <Droppable droppableId={'columns'} direction="horizontal" type={DndType.COLUMN}>
          {(provided) => (
            <div
              className={styles.columnsContainer}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columns.map((column, index) => {
                return (
                  <Column
                    key={column._id}
                    id={column._id}
                    title={column.title}
                    tasks={column.tasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
              <NewColumn />
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default BoardPage;
