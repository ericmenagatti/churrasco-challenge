import { Skeleton } from "primereact/skeleton";

const css = `
    .loadingTableComponent {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
`;

const LoadingTableState = () => {
	return (
		<div className="loadingTableComponent">
			<Skeleton width="100%" height="40px"></Skeleton>
			<Skeleton width="100%" height="40px"></Skeleton>
			<Skeleton width="100%" height="40px"></Skeleton>
			<Skeleton width="100%" height="40px"></Skeleton>
			<Skeleton width="100%" height="40px"></Skeleton>
			<style>{css}</style>
		</div>
	);
};

export default LoadingTableState;
