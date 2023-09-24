export const getBreakpoint = async () => {
    try{
        const breakpoint = await webflow.getMediaQuery();
        return breakpoint
    }catch(error){
        return "error"
    }
}